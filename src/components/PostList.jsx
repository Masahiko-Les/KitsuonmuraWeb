import { useState, useEffect } from 'react';
import { subscribeVisiblePosts, subscribePostCropGifts, subscribeCropInventory } from '../firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import PostCard from './PostCard';
import '../styles/PostList.css';

const EMPTY_INVENTORY = { carrot: 0, potato: 0, cabbage: 0 };

const PostList = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts]           = useState([]);
  const [giftCounts, setGiftCounts] = useState({});
  const [inventory, setInventory]   = useState(EMPTY_INVENTORY);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const unsub1 = subscribeVisiblePosts((data) => { setPosts(data); setLoading(false); });
    const unsub2 = subscribePostCropGifts(setGiftCounts);
    return () => { unsub1(); unsub2(); };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    return subscribeCropInventory(currentUser.uid, setInventory);
  }, [currentUser]);

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
        <PostCard
          key={post.id}
          post={post}
          giftCounts={giftCounts[post.id] || EMPTY_INVENTORY}
          inventory={inventory}
        />
      ))}
    </div>
  );
};

export default PostList;
