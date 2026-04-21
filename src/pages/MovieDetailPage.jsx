// 映画詳細ページ：セリフ・場面・感想の投稿と一覧
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  createMovieReview,
  subscribeMovieReviews,
  deleteOwnMovieReview,
} from '../firebase/firestore';
import { MOVIES } from './CinemaPage';
import BottomNav from '../components/BottomNav';
import '../styles/MovieDetailPage.css';

const MAX_LENGTH = 1000;

const MovieDetailPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const movie = MOVIES.find((m) => m.id === movieId);

  const [reviews, setReviews] = useState([]);
  const [scene, setScene] = useState('');
  const [feeling, setFeeling] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // 存在しない映画IDなら映画館へ戻す
  useEffect(() => {
    if (!movie) navigate('/cinema', { replace: true });
  }, [movie, navigate]);

  // レビューをリアルタイム購読
  useEffect(() => {
    if (!movieId) return;
    const unsubscribe = subscribeMovieReviews(movieId, setReviews);
    return unsubscribe;
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedScene = scene.trim();
    const trimmedFeeling = feeling.trim();

    if (!trimmedScene && !trimmedFeeling) {
      setError('「心に響いたセリフ・場面」か「感じたこと」のどちらかは入力してください');
      return;
    }
    if (trimmedScene.length > MAX_LENGTH || trimmedFeeling.length > MAX_LENGTH) {
      setError(`それぞれ${MAX_LENGTH}文字以内で入力してください`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createMovieReview({
        movieId,
        scene: trimmedScene,
        feeling: trimmedFeeling,
        authorUid: currentUser.uid,
        authorName: userProfile.nickname,
      });
      setScene('');
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
      await deleteOwnMovieReview(reviewId);
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

  if (!movie) return null;

  return (
    <div className="page-container">
      <header className="movie-detail-header">
        <button className="back-btn" onClick={() => navigate('/cinema')}>← 映画館へ戻る</button>
        <div className="movie-detail-title-area">
          <span className="movie-detail-emoji">{movie.emoji}</span>
          <div>
            <h1 className="movie-detail-title">{movie.title}</h1>
            {movie.originalTitle !== movie.title && (
              <p className="movie-detail-original">{movie.originalTitle}</p>
            )}
          </div>
        </div>
        <p className="movie-detail-desc">{movie.description}</p>
      </header>

      <main className="movie-detail-main">

        {/* 投稿ボタン or フォーム */}
        {!showForm ? (
          <button className="btn-primary open-form-btn" onClick={() => setShowForm(true)}>
            この映画について書く
          </button>
        ) : (
          <form className="review-form" onSubmit={handleSubmit}>
            <h2 className="review-form-title">この映画について</h2>

            <div className="form-group">
              <label htmlFor="scene">心に響いたセリフ・場面（任意・{MAX_LENGTH}文字以内）</label>
              <textarea
                id="scene"
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                placeholder="印象に残ったセリフや場面を"
                maxLength={MAX_LENGTH}
                rows={4}
              />
              <span className={`char-count ${scene.length > MAX_LENGTH ? 'over' : ''}`}>
                {scene.length} / {MAX_LENGTH}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="feeling">感じたこと（任意・{MAX_LENGTH}文字以内）</label>
              <textarea
                id="feeling"
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="観て感じたこと、考えたことを自由に"
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
                disabled={submitting || (!scene.trim() && !feeling.trim())}
              >
                {submitting ? '投稿中...' : '映画館に置く'}
              </button>
            </div>
          </form>
        )}

        {/* レビュー一覧 */}
        <section className="reviews-section">
          <h2 className="reviews-title">村人の声　{reviews.length > 0 && `（${reviews.length}件）`}</h2>

          {reviews.length === 0 ? (
            <div className="reviews-empty">
              <p>まだ投稿がありません。</p>
              <p>この映画を観た感想を置いていきませんか。</p>
            </div>
          ) : (
            <ul className="review-list">
              {reviews.map((review) => (
                <li key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="review-author">{review.authorName}</span>
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                  </div>

                  {review.scene && (
                    <div className="review-quote">
                      <span className="review-section-label">心に響いたセリフ・場面</span>
                      <blockquote>{review.scene}</blockquote>
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

export default MovieDetailPage;
