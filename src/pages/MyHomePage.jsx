// 自分の家（準備中）
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BottomNav from '../components/BottomNav';

const MyHomePage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  return (
    <div className="page-container">
      <header style={{ textAlign: 'center', padding: '20px 16px 12px', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={() => navigate('/village')}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
        >
          ← 村へ戻る
        </button>
        <h1 style={{ fontSize: '20px', color: 'var(--color-primary)', margin: '8px 0 4px' }}>自分の家</h1>
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '36px' }}>🏠</p>
        {userProfile && (
          <p style={{ fontSize: '15px', color: 'var(--color-text)' }}>
            {userProfile.nickname} さんの家
          </p>
        )}
        <p style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.8 }}>
          ここはあなただけの場所になる予定です。
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>準備中</p>
      </main>
      <BottomNav />
    </div>
  );
};

export default MyHomePage;
