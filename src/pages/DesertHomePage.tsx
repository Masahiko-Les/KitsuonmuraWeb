import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import '../styles/Desert.css';

const DesertHomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <header className="desert-header">
        <button className="desert-back-btn" onClick={() => navigate('/village')}>
          ← 村へ戻る
        </button>
        <h1 className="desert-title">砂漠の開拓</h1>
        <p className="desert-subtitle">吃音の物語を耕す場所</p>
      </header>

      <main className="desert-home-main">
        <div className="desert-hero">
          <p className="desert-hero-icon">🏜️</p>
          <p className="desert-hero-text">
            ここは、自分の吃音の物語を耕す場所です。<br />
            あなたの言葉が、誰かの灯りになるかもしれません。
          </p>
          <p className="desert-hero-sub">
            砂漠に種を撒くように、物語を残していきます。<br />
            村人たちの水やりで、その物語に花が咲いていきます。
          </p>
        </div>

        <div className="desert-home-buttons">
          <button
            className="desert-home-btn"
            onClick={() => navigate('/desert/stories')}
          >
            <span className="desert-home-btn__icon">📖</span>
            <span className="desert-home-btn__text">
              <strong>みんなの物語を読む</strong>
              <small>誰かの経験が、あなたの力になるかもしれません</small>
            </span>
          </button>

          <button
            className="desert-home-btn desert-home-btn--primary"
            onClick={() => navigate('/desert/create')}
          >
            <span className="desert-home-btn__icon">✏️</span>
            <span className="desert-home-btn__text">
              <strong>物語を書く</strong>
              <small>あなたの吃音の経験を言葉にしてみませんか</small>
            </span>
          </button>

          <button
            className="desert-home-btn"
            onClick={() => navigate('/desert/my-stories')}
          >
            <span className="desert-home-btn__icon">📝</span>
            <span className="desert-home-btn__text">
              <strong>自分の物語を見る</strong>
              <small>投稿済み・下書きを確認する</small>
            </span>
          </button>

          <button
            className="desert-home-btn"
            onClick={() => navigate('/desert/favorites')}
          >
            <span className="desert-home-btn__icon">⭐</span>
            <span className="desert-home-btn__text">
              <strong>お気に入りを見る</strong>
              <small>大切に思った物語を振り返る</small>
            </span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default DesertHomePage;
