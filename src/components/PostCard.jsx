import { useState } from 'react';
import { giveCropToPost, deleteOwnPost, reportPost } from '../firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import '../styles/PostCard.css';

const CROPS = [
  { key: 'carrot',  emoji: '🥕' },
  { key: 'potato',  emoji: '🥔' },
  { key: 'cabbage', emoji: '🥬' },
];

const PostCard = ({ post, giftCounts, inventory }) => {
  const { currentUser } = useAuth();
  const [reported, setReported]   = useState(false);
  const [giving, setGiving]       = useState(null);

  const isOwn = currentUser && post.authorUid === currentUser.uid;

  const handleGive = async (crop) => {
    if (!currentUser || isOwn || giving) return;
    if (inventory[crop] <= 0) {
      alert('その農作物の在庫がありません。家庭菜園でできたことを記録して増やしましょう！');
      return;
    }
    setGiving(crop);
    try {
      await giveCropToPost(post.id, currentUser.uid, crop);
    } catch (err) {
      if (err.message === 'not_enough_crops') {
        alert('農作物の在庫がありません');
      } else {
        console.error(err);
        alert('贈ることに失敗しました');
      }
    } finally {
      setGiving(null);
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
    if (reported) { alert('この投稿はすでに通報しています'); return; }
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

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <span className="post-author">{post.authorName}</span>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      <p className="post-text">{post.text}</p>
      <div className="post-actions">
        <div className="crop-gift-row">
          {CROPS.map(({ key, emoji }) => {
            const canGive = !isOwn && inventory[key] > 0;
            return (
              <button
                key={key}
                className={`crop-gift-btn ${canGive ? 'can-give' : ''}`}
                onClick={() => handleGive(key)}
                disabled={isOwn || giving !== null}
                title={isOwn ? '自分の投稿には贈れません' : inventory[key] <= 0 ? '在庫なし' : `${emoji}を贈る（在庫${inventory[key]}個）`}
              >
                <span className="crop-gift-emoji">{emoji}</span>
                <span className="crop-gift-count">{giftCounts[key] || 0}</span>
              </button>
            );
          })}
        </div>

        {isOwn ? (
          <button className="action-btn delete-btn" onClick={handleDelete}>削除</button>
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
