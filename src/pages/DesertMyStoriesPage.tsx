import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import DesertGrowthBadge from '../components/desert/DesertGrowthBadge';
import DesertEmptyState from '../components/desert/DesertEmptyState';
import { useAuth } from '../hooks/useAuth';
import { useDesertMyStories } from '../hooks/useDesertMyStories';
import { softDeleteDesertStory } from '../services/desertStoryService';
import '../styles/Desert.css';

const formatDate = (ts: any) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
};

const STATUS_LABELS: Record<string, string> = {
  published: '公開中',
  draft: '下書き',
  hidden: '非表示',
};

const DesertMyStoriesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth() as any;
  const { stories, setStories, loading } = useDesertMyStories(currentUser?.uid);
  const [tab, setTab] = useState<'published' | 'draft'>('published');

  const handleDelete = async (storyId: string) => {
    if (!window.confirm('この物語を削除しますか？')) return;
    await softDeleteDesertStory(storyId);
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  const filtered = stories.filter((s) =>
    tab === 'published'
      ? s.status === 'published' || s.status === 'hidden'
      : s.status === 'draft',
  );

  return (
    <div className="page-container">
      <header className="desert-header">
        <button className="desert-back-btn" onClick={() => navigate('/desert')}>
          ← 砂漠の開拓
        </button>
        <h1 className="desert-title">自分の物語</h1>
      </header>

      <main className="desert-list-main">
        <div className="desert-tab-bar">
          <button
            className={`desert-tab ${tab === 'published' ? 'desert-tab--active' : ''}`}
            onClick={() => setTab('published')}
          >
            公開済み
          </button>
          <button
            className={`desert-tab ${tab === 'draft' ? 'desert-tab--active' : ''}`}
            onClick={() => setTab('draft')}
          >
            下書き
          </button>
        </div>

        {loading && <p className="loading-text">読み込み中...</p>}

        {!loading && filtered.length === 0 && (
          <DesertEmptyState
            icon="📝"
            message={
              tab === 'published'
                ? 'まだ公開した物語がありません'
                : '下書きはありません'
            }
            actionLabel="物語を書く"
            onAction={() => navigate('/desert/create')}
          />
        )}

        {!loading && filtered.length > 0 && (
          <div className="desert-story-list">
            {filtered.map((story) => (
              <div key={story.id} className="desert-my-story-card">
                <div className="desert-my-story-card__header">
                  <DesertGrowthBadge waterCount={story.waterCount} />
                  <span className="desert-status-label">
                    {STATUS_LABELS[story.status] ?? story.status}
                  </span>
                </div>
                <h3 className="desert-story-card__title">{story.title}</h3>
                <p className="desert-story-card__preview">
                  {story.hardshipText.slice(0, 50)}
                  {story.hardshipText.length > 50 ? '...' : ''}
                </p>
                <div className="desert-my-story-card__meta">
                  <span className="desert-story-card__date">
                    更新 {formatDate(story.updatedAt)}
                  </span>
                  {story.status === 'published' && (
                    <span className="desert-story-card__water">💧 {story.waterCount}</span>
                  )}
                </div>
                <div className="desert-my-story-card__actions">
                  {story.status === 'published' && (
                    <button
                      className="desert-secondary-btn desert-secondary-btn--sm"
                      onClick={() => navigate(`/desert/stories/${story.id}`)}
                    >
                      読む
                    </button>
                  )}
                  <button
                    className="desert-secondary-btn desert-secondary-btn--sm"
                    onClick={() => navigate('/desert/create', { state: { story } })}
                  >
                    編集
                  </button>
                  <button
                    className="desert-danger-btn desert-danger-btn--sm"
                    onClick={() => handleDelete(story.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default DesertMyStoriesPage;
