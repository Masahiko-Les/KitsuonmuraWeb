import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../hooks/useAuth';
import { createDesertStory, updateDesertStory } from '../services/desertStoryService';
import { DesertStoryFormData } from '../types/desertStory';
import '../styles/Desert.css';

interface LocationState {
  formData: DesertStoryFormData;
  editStoryId: string | null;
}

const DesertStoryPreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useAuth() as any;

  const state = location.state as LocationState | null;
  const formData = state?.formData;
  const editStoryId = state?.editStoryId ?? null;

  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);

  if (!formData) {
    navigate('/desert/create', { replace: true });
    return null;
  }

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      const nickname = userProfile?.nickname ?? '名無し';
      if (editStoryId) {
        await updateDesertStory(editStoryId, { ...formData, status: 'published' });
      } else {
        await createDesertStory({
          ...formData,
          authorUid: currentUser.uid,
          authorNickname: nickname,
          status: 'published',
        });
      }
      setPublished(true);
    } catch {
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      const nickname = userProfile?.nickname ?? '名無し';
      if (editStoryId) {
        await updateDesertStory(editStoryId, { ...formData, status: 'draft' });
      } else {
        await createDesertStory({
          ...formData,
          authorUid: currentUser.uid,
          authorNickname: nickname,
          status: 'draft',
        });
      }
      navigate('/desert/my-stories', { replace: true });
    } catch {
      alert('保存に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/desert/create', { state: { formData, editStoryId } });
  };

  if (published) {
    return (
      <div className="page-container">
        <main className="desert-published-screen">
          <p className="desert-published-icon">🌱</p>
          <h2 className="desert-published-title">砂漠に種を蒔きました</h2>
          <p className="desert-published-msg">
            あなたの蒔いた種が、誰かの心の灯りになるかもしれません。<br />
            村人たちの水やりで、いつかここに花が咲きます。
          </p>
          <button className="btn-primary" onClick={() => navigate('/desert/stories')}>
            みんなの物語を読む
          </button>
          <button
            className="desert-secondary-btn"
            style={{ marginTop: '12px', width: '100%' }}
            onClick={() => navigate('/desert')}
          >
            砂漠の開拓へ戻る
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="desert-header">
        <button className="desert-back-btn" onClick={handleBack}>
          ← 編集へ戻る
        </button>
        <h1 className="desert-title">内容を確認する</h1>
        <p className="desert-subtitle">この内容で公開しますか？</p>
      </header>

      <main className="desert-preview-main">
        <div className="desert-preview-card">
          <h2 className="desert-preview-title">{formData.title}</h2>

          <section className="desert-detail-section">
            <h3 className="desert-detail-section__label">① どんな苦しみに直面しましたか？</h3>
            <p className="desert-detail-section__text">{formData.hardshipText}</p>
            <p className="desert-preview-char-count">{formData.hardshipText.trim().length}文字</p>
          </section>

          <section className="desert-detail-section">
            <h3 className="desert-detail-section__label">② それにどう向き合いましたか？</h3>
            <p className="desert-detail-section__text">{formData.facingText}</p>
            <p className="desert-preview-char-count">{formData.facingText.trim().length}文字</p>
          </section>

          <section className="desert-detail-section">
            <h3 className="desert-detail-section__label">③ どう乗り越えましたか？</h3>
            <p className="desert-detail-section__text">{formData.overcomeText}</p>
            <p className="desert-preview-char-count">{formData.overcomeText.trim().length}文字</p>
          </section>
        </div>

        <div className="desert-preview-actions">
          <button
            className="btn-primary btn-full"
            onClick={handlePublish}
            disabled={submitting}
          >
            {submitting ? '投稿中...' : '🌱 公開する'}
          </button>
          <button
            className="desert-secondary-btn"
            style={{ width: '100%' }}
            onClick={handleSaveDraft}
            disabled={submitting}
          >
            下書き保存
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default DesertStoryPreviewPage;
