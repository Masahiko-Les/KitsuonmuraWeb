// ルートガード: 認証状態に応じて適切なページへリダイレクトする
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>村への道を歩いています...</p>
      </div>
    );
  }

  // 未ログイン → ログイン画面へ
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ニックネーム未設定 or 規約未同意 → オンボーディングへ
  if (!userProfile || !userProfile.nickname || !userProfile.agreedToTerms) {
    return <Navigate to="/onboarding" replace />;
  }

  // 村人登録未完了 → 村人登録へ
  if (!userProfile.villageProfileCompleted) {
    return <Navigate to="/village-registration" replace />;
  }

  return children;
};

export default ProtectedRoute;
