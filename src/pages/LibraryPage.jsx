// 図書館トップページ：吃音に関する本の一覧
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import '../styles/LibraryPage.css';

// 図書館に並べる本（将来的に追加しやすいよう配列で管理）
export const BOOKS = [
  {
    id: 'kondo',
    title: '吃音 伝えられないもどかしさ',
    author: '近藤雄生',
    emoji: '📘',
    description: '吃音のある人が抱える、ことばにしにくい苦しさや揺れが、ていねいにたどられている一冊です。\n「うまく言えない気持ち」を、少し言葉にしてもらえるような本です。',
  },
  {
    id: 'bethel',
    title: '吃音の当事者研究 どもる人たちが「べてるの家」と出会った',
    author: '向谷地生良・伊藤伸二',
    emoji: '📗',
    description: '吃音をひとりで抱えこむのではなく、人とのつながりの中で見つめ直していく視点にふれられる本です。\n「悩み」をそのまま語り合うことの力を感じたい人に向いています。',
  },
  {
    id: 'adult-stuttering',
    title: '成人吃音とともに',
    author: '',
    emoji: '📙',
    description: '大人になってからも続いていく吃音とのつきあい方や、暮らしの中の思いに寄り添ってくれる本です。\n仕事や人間関係のなかで感じることを、静かに見つめたいときに手に取りたい一冊です。',
  },
];

const LibraryPage = () => {
  const navigate = useNavigate();

  const handleRequestBook = () => {
    // 将来：要望フォームや投稿機能へつなげる
    alert('準備中です。ご要望ありがとうございます。');
  };

  return (
    <div className="page-container">
      <header className="library-header">
        <button className="back-btn" onClick={() => navigate('/village')}>← 村へ戻る</button>
        <h1>図書館</h1>
        <p className="library-desc">吃音にまつわる本を、静かに読んでいきませんか</p>
      </header>

      <main className="library-main">
        <ul className="book-list">
          {BOOKS.map((book) => (
            <li key={book.id} className="book-card">
              <div className="book-card-top">
                <span className="book-emoji">{book.emoji}</span>
                <div className="book-info">
                  <h2 className="book-title">{book.title}</h2>
                  {book.author
                    ? <p className="book-author">{book.author}</p>
                    : <p className="book-author book-author-unknown">著者情報準備中</p>
                  }
                </div>
              </div>
              <p className="book-desc">{book.description}</p>
              <button
                className="book-read-btn"
                onClick={() => navigate(`/library/${book.id}`)}
              >
                この本を読んだ村人の声を読む
              </button>
            </li>
          ))}
        </ul>

        {/* 本の追加要望ボタン（将来実装予定） */}
        <button className="request-book-button" onClick={handleRequestBook}>
          ＋ 吃音に関する本の追加を要望
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default LibraryPage;
