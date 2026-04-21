// 自分の家：読んだ本・見た映画・できたことストックを振り返る場所
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getMyBookReviews,
  getMyMovieReviews,
  createSelfEsteemStock,
  subscribeMySelfEsteemStocks,
  deleteMySelfEsteemStock,
} from '../firebase/firestore';
import { BOOKS } from './LibraryPage';
import { MOVIES } from './CinemaPage';
import BottomNav from '../components/BottomNav';
import '../styles/HomePage.css';

const MAX_STOCK_LENGTH = 200;

// bookId → タイトルの変換
const getBookTitle = (bookId) =>
  BOOKS.find((b) => b.id === bookId)?.title ?? bookId;

// movieId → タイトルの変換
const getMovieTitle = (movieId) =>
  MOVIES.find((m) => m.id === movieId)?.title ?? movieId;

// 日時フォーマット
const formatDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ---- サブコンポーネント ----

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

const StockCard = ({ stock, onDelete }) => (
  <li className="home-card stock-card">
    <p className="stock-text">{stock.text}</p>
    <div className="stock-footer">
      <span className="home-card-date">{formatDate(stock.createdAt)}</span>
      <button className="stock-delete-btn" onClick={() => onDelete(stock.id)}>削除</button>
    </div>
  </li>
);

// ---- メインページ ----

const HomePage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [bookReviews, setBookReviews] = useState([]);
  const [movieReviews, setMovieReviews] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [stockText, setStockText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stockError, setStockError] = useState('');
  const [loading, setLoading] = useState(true);

  // 本・映画レビューを取得（一回だけ）
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

  // できたことストックをリアルタイム購読
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeMySelfEsteemStocks(currentUser.uid, setStocks);
    return unsubscribe;
  }, [currentUser]);

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

  return (
    <div className="page-container">
      <header className="home-header">
        <button className="back-btn" onClick={() => navigate('/village')}>← 村へ戻る</button>
        <h1>自分の家</h1>
        {userProfile && <p className="home-username">{userProfile.nickname} さんの家</p>}
        <p className="home-desc">
          ここは、自分の歩みを静かに置いておける場所です。<br />
          読んだ本、見た映画、できたことを少しずつ残していけます。
        </p>
      </header>

      <main className="home-main">

        {/* ── 読んだ本 ── */}
        <section className="home-section">
          <h2 className="home-section-title">📚 読んだ本</h2>
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

        {/* ── 見た映画 ── */}
        <section className="home-section">
          <h2 className="home-section-title">🎥 見た映画</h2>
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

        {/* ── できたことストック ── */}
        <section className="home-section">
          <h2 className="home-section-title">🌱 できたことストック</h2>
          <p className="home-section-desc">今日できたこと、がんばれたことを小さく残しておきましょう</p>

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
                {submitting ? '保存中...' : '残す'}
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

      </main>

      <BottomNav />
    </div>
  );
};

export default HomePage;
