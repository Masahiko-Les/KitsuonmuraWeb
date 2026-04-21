// 広場ページ：投稿フォームと投稿一覧
import PostForm from '../components/PostForm';
import PostList from '../components/PostList';
import BottomNav from '../components/BottomNav';
import '../styles/SquarePage.css';

const SquarePage = () => (
  <div className="page-container">
    <header className="square-header">
      <h1>広場</h1>
      <p className="square-desc">
        吃音に関する気持ちや体験を、そっと置いていきませんか
      </p>
    </header>

    <main className="square-main">
      <PostForm />
      <PostList />
    </main>

    <BottomNav />
  </div>
);

export default SquarePage;
