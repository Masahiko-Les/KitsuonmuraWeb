// 砂漠の開拓（準備中）
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const DesertPage = () => {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <header style={{ textAlign: 'center', padding: '20px 16px 12px', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={() => navigate('/village')}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
        >
          ← 村へ戻る
        </button>
        <h1 style={{ fontSize: '20px', color: 'var(--color-primary)', margin: '8px 0 4px' }}>砂漠の開拓</h1>
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '36px' }}>🏜️</p>
        <p style={{ fontSize: '15px', color: 'var(--color-text)', lineHeight: 1.8 }}>
          この場所は、まだ開拓されていません。<br />
          いつかここに、何かが生まれるかもしれません。
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>準備中</p>
      </main>
      <BottomNav />
    </div>
  );
};

export default DesertPage;
