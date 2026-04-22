import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import DesertStoryCard from '../components/desert/DesertStoryCard';
import DesertEmptyState from '../components/desert/DesertEmptyState';
import { useAuth } from '../hooks/useAuth';
import { useDesertFavorites } from '../hooks/useDesertFavorites';
import '../styles/Desert.css';

const DesertFavoritesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth() as any;
  const { stories, loading, error } = useDesertFavorites(currentUser?.uid);

  return (
    <div className="page-container">
      <header className="desert-header">
        <button className="desert-back-btn" onClick={() => navigate('/desert')}>
          ← 砂漠の開拓
        </button>
        <h1 className="desert-title">お気に入り</h1>
        <p className="desert-subtitle">大切に思った物語</p>
      </header>

      <main className="desert-list-main">
        {loading && <p className="loading-text">読み込み中...</p>}
        {error && <p className="desert-error">読み込みに失敗しました</p>}

        {!loading && !error && stories.length === 0 && (
          <DesertEmptyState
            icon="☆"
            message={'お気に入りの物語がまだありません。\n心に響いた物語に印をつけてみましょう。'}
            actionLabel="物語を読む"
            onAction={() => navigate('/desert/stories')}
          />
        )}

        {!loading && !error && stories.length > 0 && (
          <div className="desert-story-list">
            {stories.map((story) => (
              <DesertStoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default DesertFavoritesPage;
