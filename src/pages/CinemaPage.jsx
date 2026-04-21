// 映画館トップページ：吃音に関する映画の一覧
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import '../styles/CinemaPage.css';

// 映画館に並べる映画（将来的に追加しやすいよう配列で管理）
export const MOVIES = [
  {
    id: 'kings-speech',
    title: '英国王のスピーチ',
    originalTitle: "The King's Speech",
    emoji: '🎬',
    description: '吃音に向き合いながら、公の場で話す役割を背負っていく王の姿を描いた作品です。\nことばの苦しさと、人に支えられることの力の両方を感じられます。',
  },
  {
    id: 'rocket-science',
    title: 'Rocket Science',
    originalTitle: 'Rocket Science',
    emoji: '🎞',
    description: '吃音のある高校生が、自分の居場所やことばとの距離を探していく青春映画です。\n不器用さや焦りも含めて、若い時期の揺れに触れられる一本です。',
  },
  {
    id: 'a-fish-called-wanda',
    title: 'ワンダとダイヤと優しい奴ら',
    originalTitle: 'A Fish Called Wanda',
    emoji: '🎥',
    description: '吃音そのものが主題ではないけれど、吃音のある登場人物が印象的に描かれる有名作です。\n映画の中で、吃音のある人がどう描かれてきたかを見る入口として置いてください。',
  },
];

const CinemaPage = () => {
  const navigate = useNavigate();

  const handleRequestMovie = () => {
    // 将来：要望フォームや投稿機能へつなげる
    alert('準備中です。ご要望ありがとうございます。');
  };

  return (
    <div className="page-container">
      <header className="cinema-header">
        <button className="back-btn" onClick={() => navigate('/village')}>← 村へ戻る</button>
        <h1>映画館</h1>
        <p className="cinema-desc">吃音にまつわる映画を、静かに観ていきませんか</p>
      </header>

      <main className="cinema-main">
        <ul className="movie-list">
          {MOVIES.map((movie) => (
            <li key={movie.id} className="movie-card">
              <div className="movie-card-top">
                <span className="movie-emoji">{movie.emoji}</span>
                <div className="movie-info">
                  <h2 className="movie-title">{movie.title}</h2>
                  {movie.originalTitle !== movie.title && (
                    <p className="movie-original-title">{movie.originalTitle}</p>
                  )}
                </div>
              </div>
              <p className="movie-desc">{movie.description}</p>
              <button
                className="movie-read-btn"
                onClick={() => navigate(`/cinema/${movie.id}`)}
              >
                この映画を観た村人の声を読む
              </button>
            </li>
          ))}
        </ul>

        {/* 映画の追加要望ボタン（将来実装予定） */}
        <button className="request-movie-button" onClick={handleRequestMovie}>
          ＋ 吃音に関する映画の追加を要望
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default CinemaPage;
