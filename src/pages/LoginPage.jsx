// ログイン・新規登録ページ
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail, loginWithEmail } from '../firebase/auth';
import { updateLastLoginAt } from '../firebase/firestore';
import '../styles/LoginPage.css';

// Firebase のエラーコードを日本語メッセージに変換
const getErrorMessage = (code) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'このメールアドレスはすでに使われています';
    case 'auth/invalid-email': return 'メールアドレスの形式が正しくありません';
    case 'auth/weak-password': return 'パスワードは6文字以上にしてください';
    case 'auth/user-not-found': return 'メールアドレスまたはパスワードが違います';
    case 'auth/wrong-password': return 'メールアドレスまたはパスワードが違います';
    case 'auth/invalid-credential': return 'メールアドレスまたはパスワードが違います';
    case 'auth/too-many-requests': return 'しばらく時間をおいてから再度お試しください';
    default: return 'エラーが発生しました。もう一度お試しください';
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await signUpWithEmail(email, password);
      } else {
        userCredential = await loginWithEmail(email, password);
      }
      // ログイン・登録成功時に lastLoginAt を記録
      await updateLastLoginAt(userCredential.user.uid);
      navigate('/village');
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="village-title">吃音村</h1>
          <p className="village-subtitle">
            {isSignUp ? 'はじめまして。新しく村人になりますか？' : 'おかえりなさい。村への扉を開けましょう'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? '6文字以上' : 'パスワード'}
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? '...' : isSignUp ? '村人として登録する' : '村に入る'}
          </button>
        </form>

        <button
          className="toggle-btn"
          onClick={() => { setIsSignUp((v) => !v); setError(''); }}
        >
          {isSignUp ? 'すでに村人の方はこちら' : 'はじめての方はこちら'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
