import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import DesertStoryCard from '../components/desert/DesertStoryCard';
import DesertEmptyState from '../components/desert/DesertEmptyState';
import { useDesertStories } from '../hooks/useDesertStories';
import '../styles/Desert.css';

const DesertStoryListPage = () => {
  const navigate = useNavigate();
  const { stories, loading, error } = useDesertStories();

  return (
    <div className="page-container">
      <header className="desert-header">
        <button className="desert-back-btn" onClick={() => navigate('/desert')}>
          ← 砂漠の開拓
        </button>
        <h1 className="desert-title">みんなの物語</h1>
        <p className="desert-subtitle">村人たちが耕した、吃音の物語</p>
      </header>

      <main className="desert-list-main">
        {loading && <p className="loading-text">物語を読み込んでいます...</p>}
        {error && <p className="desert-error">読み込みに失敗しました</p>}

        {!loading && !error && stories.length === 0 && (
          <DesertEmptyState
            icon="🌱"
            message={'まだ物語がありません。\n最初の一歩を踏み出しませんか？'}
            actionLabel="物語を書く"
            onAction={() => navigate('/desert/create')}
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

export default DesertStoryListPage;
