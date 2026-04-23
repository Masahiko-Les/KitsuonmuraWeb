import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { saveVillageProfile } from '../services/villageProfileService';
import { STUTTER_TYPES, StutterType } from '../types/villageProfile';
import '../styles/VillageRegistration.css';

const VillageRegistrationPage = () => {
  const { currentUser, userProfile, loading, refreshProfile } = useAuth() as any;
  const navigate = useNavigate();

  const [stutterType, setStutterType] = useState<StutterType | ''>('');
  const [stutterTypeOther, setStutterTypeOther] = useState('');
  const [sounds, setSounds] = useState(['', '', '']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    if (userProfile?.villageProfileCompleted) {
      navigate('/village', { replace: true });
    }
  }, [loading, currentUser, userProfile, navigate]);

  const handleSoundChange = (index: number, value: string) => {
    setSounds((prev) => prev.map((s, i) => (i === index ? value.slice(0, 10) : s)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stutterType) {
      setError('吃音タイプを選択してください');
      return;
    }
    if (stutterType === 'その他' && !stutterTypeOther.trim()) {
      setError('吃音タイプの補足を入力してください');
      return;
    }
    if (sounds.some((s) => !s.trim())) {
      setError('発声しにくい音を3つすべて入力してください');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await saveVillageProfile({
        uid: currentUser.uid,
        email: currentUser.email ?? '',
        nickname: userProfile?.nickname ?? '',
        stutterType: stutterType as StutterType,
        stutterTypeOther: stutterType === 'その他' ? stutterTypeOther.trim() : '',
        difficultSoundsTop3: [
          sounds[0].trim(),
          sounds[1].trim(),
          sounds[2].trim(),
        ],
      });
      await refreshProfile();
      navigate('/village', { replace: true });
    } catch {
      setError('登録に失敗しました。もう一度お試しください');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="vr-page">
      <div className="vr-card">
        <p className="vr-icon">🌿</p>
        <h1 className="vr-title">村人登録</h1>
        <p className="vr-subtitle">吃音村へようこそ</p>
        <p className="vr-desc">
          村で暮らすための住民票を書いてください。<br />
          情報は吃音村の中だけで大切に使われます。
        </p>

        {userProfile?.nickname && (
          <div className="vr-nickname-box">
            <span className="vr-nickname-label">ニックネーム</span>
            <span className="vr-nickname-value">{userProfile.nickname}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="vr-form">

          {/* 吃音タイプ */}
          <div className="form-group">
            <label htmlFor="stutter-type">吃音タイプ</label>
            <select
              id="stutter-type"
              className="vr-select"
              value={stutterType}
              onChange={(e) => {
                setStutterType(e.target.value as StutterType | '');
                setStutterTypeOther('');
              }}
            >
              <option value="">選択してください</option>
              {STUTTER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 補足（その他のときのみ） */}
          {stutterType === 'その他' && (
            <div className="form-group">
              <label htmlFor="stutter-other">吃音タイプ（補足）</label>
              <input
                id="stutter-other"
                type="text"
                value={stutterTypeOther}
                onChange={(e) => setStutterTypeOther(e.target.value)}
                placeholder="どのような状態か教えてください"
                maxLength={100}
              />
            </div>
          )}

          {/* 発声しにくい音 */}
          <div className="form-group">
            <label>発声しにくい音 トップ3</label>
            <p className="vr-hint">
              発声しにくい音を3つ、単音で教えてください<br />
              たとえば「あ」「ふ」「は」など
            </p>
            {(['1位', '2位', '3位'] as const).map((rank, i) => (
              <div key={i} className="vr-sound-row">
                <span className="vr-sound-rank">{rank}</span>
                <input
                  type="text"
                  value={sounds[i]}
                  onChange={(e) => handleSoundChange(i, e.target.value)}
                  placeholder={['例：あ', '例：ふ', '例：は'][i]}
                  maxLength={10}
                  className="vr-sound-input"
                />
              </div>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={saving}
          >
            {saving ? '登録中...' : '村に入る 🌿'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VillageRegistrationPage;
