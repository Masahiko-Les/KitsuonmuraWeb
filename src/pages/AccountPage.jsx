// アカウントページ
import { useNavigate } from 'react-router-dom';
import { logout } from '../firebase/auth';
import { useAuth } from '../hooks/useAuth';
import BottomNav from '../components/BottomNav';
import '../styles/AccountPage.css';

const AccountPage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm('ログアウトしますか？')) return;
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
      alert('ログアウトに失敗しました');
    }
  };

  return (
    <div className="page-container">
      <header className="account-header">
        <h1>アカウント</h1>
      </header>

      <main className="account-main">
        <div className="account-card">
          <div className="account-row">
            <span className="account-label">ニックネーム</span>
            <span className="account-value">{userProfile?.nickname}</span>
          </div>
          <div className="account-row">
            <span className="account-label">メールアドレス</span>
            <span className="account-value account-email">{currentUser?.email}</span>
          </div>
        </div>

        <button className="btn-danger" onClick={handleLogout}>
          ログアウト
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default AccountPage;
