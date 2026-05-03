import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { subscribeCropInventory } from '../firebase/firestore';
import {
  subscribeThisMonthChallenges,
  subscribeLighthouseCropGifts,
  giveCropToChallenge,
  createPledge,
  addResult,
  getPeriod,
  getMonthKey,
} from '../services/lighthouseService';
import BottomNav from '../components/BottomNav';
import '../styles/LighthousePage.css';

const CROPS = [
  { key: 'carrot',  emoji: '🥕' },
  { key: 'potato',  emoji: '🥔' },
  { key: 'cabbage', emoji: '🥬' },
];

const PERIOD_INFO = {
  early: { label: '上旬', desc: '今月チャレンジしたいことを宣言できます', bg: '#fdf6ee' },
  mid:   { label: '中旬', desc: 'みんなの宣言を眺めてみましょう',           bg: '#f4f0e8' },
  late:  { label: '下旬', desc: '今月チャレンジしたことを報告できます',     bg: '#eef4f0' },
};

const MAX_LENGTH = 200;

const formatDate = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleString('ja-JP', { month: 'short', day: 'numeric' });
};

const CropGiftButtons = ({ challengeId, giftCounts, inventory, giverUid }) => {
  const [giving, setGiving] = useState(null);

  const handle = async (crop) => {
    if (giving) return;
    if (!inventory || inventory[crop] <= 0) {
      alert('その農作物の在庫がありません。家庭菜園でできたことを記録して増やしましょう！');
      return;
    }
    setGiving(crop);
    try {
      await giveCropToChallenge(challengeId, giverUid, crop);
    } catch (err) {
      if (err.message === 'not_enough_crops') alert('農作物の在庫がありません');
      else { console.error(err); alert('贈ることに失敗しました'); }
    } finally {
      setGiving(null);
    }
  };

  return (
    <div className="lh-crop-row">
      {CROPS.map(({ key, emoji }) => {
        const canGive = inventory && inventory[key] > 0;
        return (
          <button
            key={key}
            className={`lh-crop-btn ${canGive ? 'can-give' : ''}`}
            onClick={() => handle(key)}
            disabled={giving !== null}
            title={canGive ? `${emoji}を贈る（在庫${inventory[key]}個）` : '在庫なし'}
          >
            <span>{emoji}</span>
            <span className="lh-crop-count">{giftCounts[key] || 0}</span>
          </button>
        );
      })}
    </div>
  );
};

const ChallengeCard = ({ challenge, giftCounts, inventory, giverUid }) => (
  <div className={`lh-card ${challenge.result ? 'has-result' : ''}`}>
    <div className="lh-card-header">
      <span className="lh-card-author">{challenge.authorName}</span>
      <span className="lh-card-date">{formatDate(challenge.createdAt)}</span>
    </div>
    <div className="lh-card-section">
      <span className="lh-card-label">今月のチャレンジ</span>
      <p className="lh-card-text">{challenge.pledge}</p>
    </div>
    {challenge.result && (
      <div className="lh-card-section lh-result-block">
        <span className="lh-card-label">やってみた！</span>
        <p className="lh-card-text">{challenge.result}</p>
        <span className="lh-result-date">{formatDate(challenge.resultAt)}</span>
      </div>
    )}
    <CropGiftButtons
      challengeId={challenge.id}
      giftCounts={giftCounts}
      inventory={inventory}
      giverUid={giverUid}
    />
  </div>
);

const LighthousePage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const period = getPeriod();

  const [challenges, setChallenges] = useState([]);
  const [giftCounts, setGiftCounts] = useState({});
  const [inventory, setInventory]   = useState({ carrot: 0, potato: 0, cabbage: 0 });
  const [pledgeText, setPledgeText] = useState('');
  const [resultText, setResultText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    const unsub1 = subscribeThisMonthChallenges(setChallenges);
    const unsub2 = subscribeLighthouseCropGifts(setGiftCounts);
    return () => { unsub1(); unsub2(); };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    return subscribeCropInventory(currentUser.uid, setInventory);
  }, [currentUser]);

  const myChallenge = challenges.find((c) => c.authorUid === currentUser?.uid) ?? null;
  const others      = challenges.filter((c) => c.authorUid !== currentUser?.uid);

  const handlePledge = async (e) => {
    e.preventDefault();
    const trimmed = pledgeText.trim();
    if (!trimmed) { setError('チャレンジを入力してください'); return; }
    if (trimmed.length > MAX_LENGTH) { setError(`${MAX_LENGTH}文字以内で入力してください`); return; }
    setSubmitting(true); setError('');
    try {
      await createPledge({
        authorUid:  currentUser.uid,
        authorName: userProfile?.nickname ?? '村人',
        pledge:     trimmed,
      });
      setPledgeText('');
    } catch (err) {
      if (err.message === 'already_pledged') setError('今月はすでに宣言しています');
      else { console.error(err); setError('投稿に失敗しました'); }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResult = async (e) => {
    e.preventDefault();
    const trimmed = resultText.trim();
    if (!trimmed) { setError('内容を入力してください'); return; }
    if (trimmed.length > MAX_LENGTH) { setError(`${MAX_LENGTH}文字以内で入力してください`); return; }
    setSubmitting(true); setError('');
    try {
      await addResult(myChallenge.id, trimmed);
      setResultText('');
    } catch (err) {
      console.error(err); setError('投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const periodInfo = PERIOD_INFO[period];
  const [year, mon] = getMonthKey().split('-');

  return (
    <div className="page-container">
      <header className="lh-header">
        <button className="back-btn" onClick={() => navigate('/village')}>← 村へ戻る</button>
        <h1>灯台</h1>
        <p className="lh-desc">チャレンジした体験が、誰かの希望になる</p>
      </header>

      <main className="lh-main">

        {/* 期間バナー */}
        <div className="lh-period-banner" style={{ background: periodInfo.bg }}>
          <span className="lh-period-label">{year}年{parseInt(mon, 10)}月 {periodInfo.label}</span>
          <span className="lh-period-desc">{periodInfo.desc}</span>
        </div>

        {/* 自分のチャレンジ */}
        <section className="lh-section">
          <h2 className="lh-section-title">自分のチャレンジ</h2>

          {/* 上旬 & 未宣言：宣言フォーム */}
          {period === 'early' && !myChallenge && (
            <form className="lh-form" onSubmit={handlePledge}>
              <span className="lh-form-label">今月チャレンジしたいことは？</span>
              <textarea
                className="lh-textarea"
                value={pledgeText}
                onChange={(e) => setPledgeText(e.target.value)}
                placeholder="例：電話でアポイントを取ってみる"
                rows={3}
                maxLength={MAX_LENGTH}
              />
              <div className="lh-form-footer">
                <span className="lh-char-count">{pledgeText.length} / {MAX_LENGTH}</span>
                <button type="submit" className="btn-primary" disabled={submitting || !pledgeText.trim()}>
                  {submitting ? '投稿中...' : '宣言する 🔥'}
                </button>
              </div>
              {error && <p className="form-error">{error}</p>}
            </form>
          )}

          {/* 中旬 or 下旬 & 未宣言 */}
          {period !== 'early' && !myChallenge && (
            <p className="lh-empty">今月の宣言はありません。来月の上旬（1〜10日）に投稿できます。</p>
          )}

          {/* 宣言済み */}
          {myChallenge && (
            <div className="lh-my-card">
              <div className="lh-card-section">
                <span className="lh-card-label">今月のチャレンジ</span>
                <p className="lh-card-text">{myChallenge.pledge}</p>
              </div>

              {/* 結果あり */}
              {myChallenge.result && (
                <div className="lh-card-section lh-result-block">
                  <span className="lh-card-label">やってみた！</span>
                  <p className="lh-card-text">{myChallenge.result}</p>
                </div>
              )}

              {/* 下旬 & 結果未報告：結果フォーム */}
              {period === 'late' && !myChallenge.result && (
                <form className="lh-result-form" onSubmit={handleResult}>
                  <span className="lh-form-label">今月チャレンジしたこと・気づいたことは？</span>
                  <textarea
                    className="lh-textarea"
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                    placeholder="例：緊張したけど、なんとか言えた！"
                    rows={3}
                    maxLength={MAX_LENGTH}
                  />
                  <div className="lh-form-footer">
                    <span className="lh-char-count">{resultText.length} / {MAX_LENGTH}</span>
                    <button type="submit" className="btn-primary" disabled={submitting || !resultText.trim()}>
                      {submitting ? '投稿中...' : '報告する ⚡'}
                    </button>
                  </div>
                  {error && <p className="form-error">{error}</p>}
                </form>
              )}

              {/* 中旬 & 結果未報告 */}
              {period === 'mid' && !myChallenge.result && (
                <p className="lh-waiting">下旬（21日〜）になると結果を報告できます</p>
              )}
            </div>
          )}
        </section>

        {/* みんなのチャレンジ */}
        <section className="lh-section">
          <h2 className="lh-section-title">みんなのチャレンジ</h2>
          {others.length === 0 ? (
            <p className="lh-empty">まだ投稿はありません</p>
          ) : (
            <div className="lh-card-list">
              {others.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  giftCounts={giftCounts[c.id] || { carrot: 0, potato: 0, cabbage: 0 }}
                  inventory={inventory}
                  giverUid={currentUser?.uid}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      <BottomNav />
    </div>
  );
};

export default LighthousePage;
