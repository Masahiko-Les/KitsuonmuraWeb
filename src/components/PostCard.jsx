// 1件の投稿カード
import { useState, useEffect } from 'react';
import { toggleLike, deleteOwnPost, reportPost, checkLiked } from '../firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import '../styles/PostCard.css';

const PostCard = ({ post }) => {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [reported, setReported] = useState(false);

  const isOwn = currentUser && post.authorUid === currentUser.uid;

  // 初回マウント時にいいね状態を確認
  useEffect(() => {
    if (!currentUser) return;
    checkLiked(post.id, currentUser.uid).then(setLiked);
  }, [post.id, currentUser]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      await toggleLike(post.id, currentUser.uid);
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('この投稿を削除しますか？')) return;
    try {
      await deleteOwnPost(post.id);
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  const handleReport = async () => {
    if (isOwn) {
      alert('自分の投稿は通報できません');
      return;
    }
    if (reported) {
      alert('この投稿はすでに通報しています');
      return;
    }
    if (!window.confirm('この投稿を通報しますか？')) return;
    try {
      await reportPost(post.id, currentUser.uid);
      setReported(true);
      alert('通報しました。ご協力ありがとうございます');
    } catch (err) {
      if (err.message === 'already_reported') {
        setReported(true);
        alert('この投稿はすでに通報しています');
      } else {
        console.error(err);
        alert('通報に失敗しました');
      }
    }
  };

  // 日時フォーマット
  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('ja-JP', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <span className="post-author">{post.authorName}</span>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      <p className="post-text">{post.text}</p>
      <div className="post-actions">
        <button
          className={`action-btn like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={likeLoading}
        >
          {liked ? '♥' : '♡'} {likeCount}
        </button>

        {isOwn ? (
          <button className="action-btn delete-btn" onClick={handleDelete}>
            削除
          </button>
        ) : (
          <button
            className={`action-btn report-btn ${reported ? 'reported' : ''}`}
            onClick={handleReport}
            disabled={reported}
          >
            {reported ? '通報済' : '通報'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
