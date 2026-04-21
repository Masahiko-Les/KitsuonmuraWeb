// 本の詳細ページ：引用・感想の投稿と一覧
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  createBookReview,
  subscribeBookReviews,
  deleteOwnBookReview,
} from '../firebase/firestore';
import { BOOKS } from './LibraryPage';
import BottomNav from '../components/BottomNav';
import '../styles/BookDetailPage.css';

const MAX_LENGTH = 1000;

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const book = BOOKS.find((b) => b.id === bookId);

  const [reviews, setReviews] = useState([]);
  const [quote, setQuote] = useState('');
  const [feeling, setFeeling] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // 存在しない本IDなら図書館へ戻す
  useEffect(() => {
    if (!book) navigate('/library', { replace: true });
  }, [book, navigate]);

  // 書評をリアルタイム購読
  useEffect(() => {
    if (!bookId) return;
    const unsubscribe = subscribeBookReviews(bookId, setReviews);
    return unsubscribe;
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedQuote = quote.trim();
    const trimmedFeeling = feeling.trim();

    if (!trimmedQuote && !trimmedFeeling) {
      setError('「心に響いた引用」か「感じたこと」のどちらかは入力してください');
      return;
    }
    if (trimmedQuote.length > MAX_LENGTH || trimmedFeeling.length > MAX_LENGTH) {
      setError(`それぞれ${MAX_LENGTH}文字以内で入力してください`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createBookReview({
        bookId,
        quote: trimmedQuote,
        feeling: trimmedFeeling,
        authorUid: currentUser.uid,
        authorName: userProfile.nickname,
      });
      setQuote('');
      setFeeling('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError('投稿に失敗しました。もう一度お試しください');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('この投稿を削除しますか？')) return;
    try {
      await deleteOwnBookReview(reviewId);
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!book) return null;

  return (
    <div className="page-container">
      <header className="book-detail-header">
        <button className="back-btn" onClick={() => navigate('/library')}>← 図書館へ戻る</button>
        <div className="book-detail-title-area">
          <span className="book-detail-emoji">{book.emoji}</span>
          <div>
            <h1 className="book-detail-title">{book.title}</h1>
            <p className="book-detail-author">{book.author}　{book.publisher}</p>
          </div>
        </div>
        <p className="book-detail-desc">{book.description}</p>
      </header>

      <main className="book-detail-main">

        {/* 投稿ボタン or フォーム */}
        {!showForm ? (
          <button className="btn-primary open-form-btn" onClick={() => setShowForm(true)}>
            この本について書く
          </button>
        ) : (
          <form className="review-form" onSubmit={handleSubmit}>
            <h2 className="review-form-title">この本について</h2>

            <div className="form-group">
              <label htmlFor="quote">心に響いた引用（任意・{MAX_LENGTH}文字以内）</label>
              <textarea
                id="quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="本の中で印象に残った一文や言葉を"
                maxLength={MAX_LENGTH}
                rows={4}
              />
              <span className={`char-count ${quote.length > MAX_LENGTH ? 'over' : ''}`}>
                {quote.length} / {MAX_LENGTH}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="feeling">感じたこと（任意・{MAX_LENGTH}文字以内）</label>
              <textarea
                id="feeling"
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="読んで感じたこと、考えたことを自由に"
                maxLength={MAX_LENGTH}
                rows={4}
              />
              <span className={`char-count ${feeling.length > MAX_LENGTH ? 'over' : ''}`}>
                {feeling.length} / {MAX_LENGTH}
              </span>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="review-form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => { setShowForm(false); setError(''); }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || (!quote.trim() && !feeling.trim())}
              >
                {submitting ? '投稿中...' : '図書館に置く'}
              </button>
            </div>
          </form>
        )}

        {/* 書評一覧 */}
        <section className="reviews-section">
          <h2 className="reviews-title">村人の声　{reviews.length > 0 && `（${reviews.length}件）`}</h2>

          {reviews.length === 0 ? (
            <div className="reviews-empty">
              <p>まだ投稿がありません。</p>
              <p>最初の一冊を読んだ感想を置いていきませんか。</p>
            </div>
          ) : (
            <ul className="review-list">
              {reviews.map((review) => (
                <li key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="review-author">{review.authorName}</span>
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                  </div>

                  {review.quote && (
                    <div className="review-quote">
                      <span className="review-section-label">心に響いた引用</span>
                      <blockquote>{review.quote}</blockquote>
                    </div>
                  )}

                  {review.feeling && (
                    <div className="review-feeling">
                      <span className="review-section-label">感じたこと</span>
                      <p>{review.feeling}</p>
                    </div>
                  )}

                  {currentUser && review.authorUid === currentUser.uid && (
                    <button
                      className="review-delete-btn"
                      onClick={() => handleDelete(review.id)}
                    >
                      削除
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default BookDetailPage;
