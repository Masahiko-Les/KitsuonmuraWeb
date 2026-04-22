import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import DesertGrowthBadge from '../components/desert/DesertGrowthBadge';
import DesertWaterButton from '../components/desert/DesertWaterButton';
import { useAuth } from '../hooks/useAuth';
import { useDesertStoryDetail } from '../hooks/useDesertStoryDetail';
import { toggleDesertWater } from '../services/desertWaterService';
import { toggleDesertFavorite } from '../services/desertFavoriteService';
import { reportDesertStory } from '../services/desertReportService';
import { softDeleteDesertStory } from '../services/desertStoryService';
import '../styles/Desert.css';

const formatDate = (ts: any) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
};

const DesertStoryDetailPage = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth() as any;

  const { story, isWatered, setIsWatered, isFavorited, setIsFavorited, loading, error } =
    useDesertStoryDetail(storyId!, currentUser?.uid);

  const [localWaterCount, setLocalWaterCount] = useState<number | null>(null);
  const [reportDone, setReportDone] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const displayWaterCount = localWaterCount ?? story?.waterCount ?? 0;

  const handleWater = async () => {
    if (!currentUser || !storyId) return;
    const watered = await toggleDesertWater(storyId, currentUser.uid);
    setIsWatered(watered);
    setLocalWaterCount((displayWaterCount) + (watered ? 1 : -1));
  };

  const handleFavorite = async () => {
    if (!currentUser || !storyId) return;
    const faved = await toggleDesertFavorite(storyId, currentUser.uid);
    setIsFavorited(faved);
  };

  const handleReport = async () => {
    if (!currentUser || !storyId || reportDone) return;
    if (!window.confirm('この物語を通報しますか？')) return;
    try {
      await reportDesertStory(storyId, currentUser.uid);
      setReportDone(true);
    } catch (e: any) {
      if (e.message === 'already_reported') alert('すでに通報済みです');
    }
  };

  const handleDelete = async () => {
    if (!storyId) return;
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    await softDeleteDesertStory(storyId);
    navigate('/desert/my-stories', { replace: true });
  };

  if (loading) {
    return <div className="loading-screen"><p>物語を読み込んでいます...</p></div>;
  }

  if (error || !story) {
    return (
      <div className="page-container">
        <main style={{ padding: '32px 16px', textAlign: 'center' }}>
          <p className="desert-error">物語が見つかりませんでした</p>
          <button
            className="btn-primary"
            style={{ marginTop: '16px' }}
            onClick={() => navigate('/desert/stories')}
          >
            一覧へ戻る
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const isOwner = currentUser?.uid === story.authorUid;

  return (
    <div className="page-container">
      <header className="desert-header">
        <button className="desert-back-btn" onClick={() => navigate(-1)}>
          ← 戻る
        </button>
      </header>

      <main className="desert-detail-main">
        <div className="desert-detail-hero">
          <div className="desert-detail-badges">
            <DesertGrowthBadge waterCount={displayWaterCount} />
            {story.status === 'hidden' && (
              <span className="desert-status-badge--hidden">非表示</span>
            )}
          </div>
          <h2 className="desert-detail-title">{story.title}</h2>
          <div className="desert-detail-meta">
            <span>{story.authorNickname}</span>
            <span>{formatDate(story.publishedAt)}</span>
          </div>
        </div>

        <section className="desert-detail-section">
          <h3 className="desert-detail-section__label">① どんな苦しみに直面しましたか？</h3>
          <p className="desert-detail-section__text">{story.hardshipText}</p>
        </section>

        <section className="desert-detail-section">
          <h3 className="desert-detail-section__label">② それにどう向き合いましたか？</h3>
          <p className="desert-detail-section__text">{story.facingText}</p>
        </section>

        <section className="desert-detail-section">
          <h3 className="desert-detail-section__label">③ どう乗り越えましたか？</h3>
          <p className="desert-detail-section__text">{story.overcomeText}</p>
        </section>

        <div className="desert-detail-actions">
          <DesertWaterButton
            isWatered={isWatered}
            waterCount={displayWaterCount}
            onToggle={handleWater}
            disabled={!currentUser}
          />

          <button
            className={`desert-fav-btn ${isFavorited ? 'desert-fav-btn--active' : ''}`}
            onClick={handleFavorite}
            disabled={!currentUser}
          >
            {isFavorited ? '⭐ お気に入り済み' : '☆ お気に入りに追加'}
          </button>

          {isOwner ? (
            <div className="desert-owner-actions">
              <button
                className="desert-secondary-btn"
                onClick={() => navigate('/desert/create', { state: { story } })}
              >
                編集する
              </button>
              <button className="desert-danger-btn" onClick={handleDelete}>
                {deleteConfirm ? '本当に削除する' : '削除する'}
              </button>
            </div>
          ) : (
            <button
              className="desert-report-btn"
              onClick={handleReport}
              disabled={reportDone}
            >
              {reportDone ? '通報しました' : '通報する'}
            </button>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default DesertStoryDetailPage;
