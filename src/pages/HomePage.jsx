import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getMyBookReviews,
  getMyMovieReviews,
  createSelfEsteemStock,
  subscribeMySelfEsteemStocks,
  deleteMySelfEsteemStock,
  subscribeCropInventory,
} from '../firebase/firestore';
import { BOOKS } from './LibraryPage';
import { MOVIES } from './CinemaPage';
import BottomNav from '../components/BottomNav';
import '../styles/HomePage.css';

const MAX_STOCK_LENGTH = 200;

const ROOMS = [
  { id: 'bookshelf', label: '本棚',          icon: '📚', position: { top: '36%', left: '68%' } },
  { id: 'projector', label: 'プロジェクター', icon: '🎬', position: { top: '44%', left: '26%' } },
  { id: 'desk',      label: '勉強机',         icon: '📝', position: { top: '56%', left: '74%' } },
  { id: 'garden',    label: '家庭菜園',       icon: '🌱', position: { top: '82%', left: '48%' } },
];

const getBookTitle  = (id) => BOOKS.find((b) => b.id === id)?.title  ?? id;
const getMovieTitle = (id) => MOVIES.find((m) => m.id === id)?.title ?? id;

const formatDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
};

const BookRecordCard = ({ review }) => (
  <li className="home-card">
    <p className="home-card-tag">📘 {getBookTitle(review.bookId)}</p>
    {review.quote && (
      <div className="home-card-section">
        <span className="home-card-label">心に響いた引用</span>
        <blockquote className="home-card-quote">{review.quote}</blockquote>
      </div>
    )}
    {review.feeling && (
      <div className="home-card-section">
        <span className="home-card-label">感じたこと</span>
        <p className="home-card-text">{review.feeling}</p>
      </div>
    )}
    <p className="home-card-date">{formatDate(review.createdAt)}</p>
  </li>
);

const MovieRecordCard = ({ review }) => (
  <li className="home-card">
    <p className="home-card-tag">🎬 {getMovieTitle(review.movieId)}</p>
    {review.scene && (
      <div className="home-card-section">
        <span className="home-card-label">心に響いたセリフ・場面</span>
        <blockquote className="home-card-quote">{review.scene}</blockquote>
      </div>
    )}
    {review.feeling && (
      <div className="home-card-section">
        <span className="home-card-label">感じたこと</span>
        <p className="home-card-text">{review.feeling}</p>
      </div>
    )}
    <p className="home-card-date">{formatDate(review.createdAt)}</p>
  </li>
);

const CROPS = [
  { key: 'carrot',  emoji: '🥕', label: 'ニンジン' },
  { key: 'potato',  emoji: '🥔', label: 'ジャガイモ' },
  { key: 'cabbage', emoji: '🥬', label: 'キャベツ' },
];

const cropEmoji = (key) => CROPS.find((c) => c.key === key)?.emoji ?? '🥕';

const StockCard = ({ stock, onDelete }) => (
  <li className="home-card stock-card">
    <p className="stock-text">
      <span className="stock-crop-emoji">{cropEmoji(stock.crop)}</span>
      {stock.text}
    </p>
    <div className="stock-footer">
      <span className="home-card-date">{formatDate(stock.createdAt)}</span>
      <button className="stock-delete-btn" onClick={() => onDelete(stock.id)}>削除</button>
    </div>
  </li>
);

const HomePage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [bookReviews, setBookReviews]   = useState([]);
  const [movieReviews, setMovieReviews] = useState([]);
  const [stocks, setStocks]             = useState([]);
  const [inventory, setInventory]       = useState({ carrot: 0, potato: 0, cabbage: 0 });
  const [stockText, setStockText]       = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [stockError, setStockError]     = useState('');
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getMyBookReviews(currentUser.uid),
      getMyMovieReviews(currentUser.uid),
    ]).then(([books, movies]) => {
      setBookReviews(books);
      setMovieReviews(movies);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub1 = subscribeMySelfEsteemStocks(currentUser.uid, setStocks);
    const unsub2 = subscribeCropInventory(currentUser.uid, setInventory);
    return () => { unsub1(); unsub2(); };
  }, [currentUser]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    const trimmed = stockText.trim();
    if (!trimmed) { setStockError('ひとことどうぞ'); return; }
    if (trimmed.length > MAX_STOCK_LENGTH) {
      setStockError(`${MAX_STOCK_LENGTH}文字以内で入力してください`);
      return;
    }
    setSubmitting(true);
    setStockError('');
    try {
      await createSelfEsteemStock({ text: trimmed, authorUid: currentUser.uid });
      setStockText('');
    } catch (err) {
      console.error(err);
      setStockError('投稿に失敗しました。もう一度お試しください');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockDelete = async (stockId) => {
    if (!window.confirm('この記録を削除しますか？')) return;
    try {
      await deleteMySelfEsteemStock(stockId);
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  const v = userProfile;

  return (
    <div className="page-container">
      <header className="home-header">
        <button className="back-btn" onClick={() => navigate('/village')}>← 村へ戻る</button>
        <h1>自分の家</h1>
        {v && <p className="home-username">{v.nickname} さんの家</p>}
      </header>

      {/* ── 家の画像 + 部屋ボタン ── */}
      <div className="home-map-wrapper">
        <img src="/myhome.png" alt="自分の家" className="home-map-image" draggable={false} />
        {ROOMS.map((room) => (
          <button
            key={room.id}
            className="home-map-btn"
            style={room.position}
            onClick={() => scrollTo(room.id)}
          >
            <span className="home-map-label">{room.label}</span>
          </button>
        ))}
      </div>

      <main className="home-main">

        {/* ── 勉強机 ── */}
        <section id="desk" className="home-section">
          <h2 className="home-section-title">📝 勉強机</h2>
          {v ? (
            <div className="home-desk-card">
              <div className="home-desk-row">
                <span className="home-desk-label">ニックネーム</span>
                <span className="home-desk-value">{v.nickname}</span>
              </div>
              <div className="home-desk-row">
                <span className="home-desk-label">村人番号</span>
                <span className="home-desk-value">{v.villagerNo ?? '—'}</span>
              </div>
              <div className="home-desk-row">
                <span className="home-desk-label">メールアドレス</span>
                <span className="home-desk-value">{v.email ?? '—'}</span>
              </div>
              {v.stutterType && (
                <div className="home-desk-row">
                  <span className="home-desk-label">吃音タイプ</span>
                  <span className="home-desk-value">
                    {v.stutterType === 'その他' && v.stutterTypeOther
                      ? `その他（${v.stutterTypeOther}）`
                      : v.stutterType}
                  </span>
                </div>
              )}
              {v.difficultSoundsTop3?.length > 0 && (
                <div className="home-desk-row">
                  <span className="home-desk-label">発声しにくい音</span>
                  <div className="home-desk-sounds">
                    {v.difficultSoundsTop3.map((s, i) => (
                      <span key={i} className="home-desk-badge">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="home-empty">プロフィール情報がありません</p>
          )}
        </section>

        {/* ── 家庭菜園 ── */}
        <section id="garden" className="home-section">
          <h2 className="home-section-title">🌱 家庭菜園</h2>
          <p className="home-section-desc">できたことを残すと、農作物が1つ手に入ります</p>

          {/* 農作物カウント（手持ちの在庫） */}
          <div className="garden-harvest-grid">
            {CROPS.map((crop) => (
              <div key={crop.key} className="garden-harvest-item">
                <span className="garden-harvest-icon">{crop.emoji}</span>
                <span className="garden-harvest-count">{inventory[crop.key]}</span>
                <span className="garden-harvest-label">{crop.label}</span>
              </div>
            ))}
          </div>

          <form className="stock-form" onSubmit={handleStockSubmit}>
            <textarea
              className="stock-textarea"
              value={stockText}
              onChange={(e) => setStockText(e.target.value)}
              placeholder="例：今日、電話で自分の名前を言えた"
              maxLength={MAX_STOCK_LENGTH}
              rows={3}
            />
            <div className="stock-form-footer">
              <span className={`char-count ${stockText.length > MAX_STOCK_LENGTH ? 'over' : ''}`}>
                {stockText.length} / {MAX_STOCK_LENGTH}
              </span>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !stockText.trim()}
              >
                {submitting ? '保存中...' : '残す +🥕'}
              </button>
            </div>
            {stockError && <p className="form-error">{stockError}</p>}
          </form>

          {stocks.length === 0 ? (
            <p className="home-empty">まだ記録はありません。小さなことでも残してみてください</p>
          ) : (
            <ul className="home-card-list">
              {stocks.map((s) => (
                <StockCard key={s.id} stock={s} onDelete={handleStockDelete} />
              ))}
            </ul>
          )}
        </section>

        {/* ── 本棚 ── */}
        <section id="bookshelf" className="home-section">
          <h2 className="home-section-title">📚 本棚</h2>
          {loading ? (
            <p className="home-empty">読み込み中...</p>
          ) : bookReviews.length === 0 ? (
            <p className="home-empty">まだ本の記録はありません</p>
          ) : (
            <ul className="home-card-list">
              {bookReviews.map((r) => <BookRecordCard key={r.id} review={r} />)}
            </ul>
          )}
        </section>

        {/* ── プロジェクター ── */}
        <section id="projector" className="home-section">
          <h2 className="home-section-title">🎬 プロジェクター</h2>
          {loading ? (
            <p className="home-empty">読み込み中...</p>
          ) : movieReviews.length === 0 ? (
            <p className="home-empty">まだ映画の記録はありません</p>
          ) : (
            <ul className="home-card-list">
              {movieReviews.map((r) => <MovieRecordCard key={r.id} review={r} />)}
            </ul>
          )}
        </section>

      </main>

      <BottomNav />
    </div>
  );
};

export default HomePage;
