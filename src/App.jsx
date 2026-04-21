// ルーティング設定とアプリ全体のラッパー
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import VillagePage from './pages/VillagePage';
import SquarePage from './pages/SquarePage';
import AccountPage from './pages/AccountPage';
import LibraryPage from './pages/LibraryPage';
import BookDetailPage from './pages/BookDetailPage';
import CinemaPage from './pages/CinemaPage';
import MovieDetailPage from './pages/MovieDetailPage';
import DesertPage from './pages/DesertPage';
import HomePage from './pages/HomePage';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* 公開ページ */}
        <Route path="/login" element={<LoginPage />} />

        {/* ログイン済みが前提のオンボーディング（ProtectedRoute外で独自処理） */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* 保護されたページ（未ログイン・未オンボーディングはリダイレクト） */}
        <Route
          path="/village"
          element={<ProtectedRoute><VillagePage /></ProtectedRoute>}
        />
        <Route
          path="/square"
          element={<ProtectedRoute><SquarePage /></ProtectedRoute>}
        />
        <Route
          path="/account"
          element={<ProtectedRoute><AccountPage /></ProtectedRoute>}
        />
        <Route
          path="/library"
          element={<ProtectedRoute><LibraryPage /></ProtectedRoute>}
        />
        <Route
          path="/library/:bookId"
          element={<ProtectedRoute><BookDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/cinema"
          element={<ProtectedRoute><CinemaPage /></ProtectedRoute>}
        />
        <Route
          path="/cinema/:movieId"
          element={<ProtectedRoute><MovieDetailPage /></ProtectedRoute>}
        />

        <Route
          path="/desert"
          element={<ProtectedRoute><DesertPage /></ProtectedRoute>}
        />
        <Route
          path="/home"
          element={<ProtectedRoute><HomePage /></ProtectedRoute>}
        />

        {/* その他のパスはトップへ */}
        <Route path="*" element={<Navigate to="/village" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
