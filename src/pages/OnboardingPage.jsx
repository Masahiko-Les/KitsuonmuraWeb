// オンボーディングページ：ニックネーム登録 + 利用規約同意
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrMergeUserProfile } from '../firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import '../styles/OnboardingPage.css';

const TERMS_URL = 'https://apricot-turret-50e.notion.site/31505149608d80749ddddacc26be0c98';

const OnboardingPage = () => {
  const { currentUser, userProfile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // すでにオンボーディング済みなら村マップへ
  useEffect(() => {
    if (!loading && userProfile?.nickname && userProfile?.agreedToTerms) {
      navigate('/village', { replace: true });
    }
  }, [loading, userProfile, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('ニックネームを入力してください');
      return;
    }
    if (trimmed.length > 20) {
      setError('ニックネームは20文字以内にしてください');
      return;
    }
    if (!agreed) {
      setError('利用規約への同意が必要です');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createOrMergeUserProfile(currentUser.uid, {
        nickname: trimmed,
        agreedToTerms: true,
        email: currentUser.email,
        createdAt: new Date(),
      });
      await refreshProfile();
      navigate('/village', { replace: true });
    } catch (err) {
      console.error(err);
      setError('保存に失敗しました。もう一度お試しください');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <h1 className="onboarding-title">吃音村へようこそ</h1>
        <p className="onboarding-desc">
          ここは、吃音にまつわる気持ちや体験を<br />
          安心して話せる場所です。<br />
          まず、村で呼ばれたいお名前を教えてください。
        </p>

        <form onSubmit={handleSave} className="onboarding-form">
          <div className="form-group">
            <label htmlFor="nickname">ニックネーム（20文字以内）</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例：はる、もりのこ"
              maxLength={20}
              required
            />
          </div>

          <div className="terms-section">
            <a
              href={TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="terms-link"
            >
              📜 利用規約を読む
            </a>
            <label className="agree-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>利用規約に同意します</span>
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={saving || !nickname.trim() || !agreed}
          >
            {saving ? '準備中...' : '村に入る'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
