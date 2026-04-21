// 投稿一覧を表示するコンポーネント
import { useState, useEffect } from 'react';
import { subscribeVisiblePosts } from '../firebase/firestore';
import PostCard from './PostCard';
import '../styles/PostList.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // リアルタイムで投稿を購読
    const unsubscribe = subscribeVisiblePosts((data) => {
      setPosts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <p className="loading-text">投稿を読み込んでいます...</p>;

  if (posts.length === 0) {
    return (
      <div className="empty-posts">
        <p>まだ投稿がありません。</p>
        <p>最初のひとことを置いていきませんか。</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
