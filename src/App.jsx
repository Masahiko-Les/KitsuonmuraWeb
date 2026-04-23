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
import DesertHomePage from './pages/DesertHomePage';
import DesertStoryListPage from './pages/DesertStoryListPage';
import DesertStoryDetailPage from './pages/DesertStoryDetailPage';
import DesertStoryCreatePage from './pages/DesertStoryCreatePage';
import DesertStoryPreviewPage from './pages/DesertStoryPreviewPage';
import DesertMyStoriesPage from './pages/DesertMyStoriesPage';
import DesertFavoritesPage from './pages/DesertFavoritesPage';
import HomePage from './pages/HomePage';
import VillageRegistrationPage from './pages/VillageRegistrationPage';
import TownHallPage from './pages/TownHallPage';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* 公開ページ */}
        <Route path="/login" element={<LoginPage />} />

        {/* ログイン済みが前提のオンボーディング（ProtectedRoute外で独自処理） */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* 村人登録（ProtectedRouteの villageProfileCompleted チェック前に独自処理） */}
        <Route path="/village-registration" element={<VillageRegistrationPage />} />

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

        {/* 砂漠の開拓 */}
        <Route
          path="/desert"
          element={<ProtectedRoute><DesertHomePage /></ProtectedRoute>}
        />
        <Route
          path="/desert/stories"
          element={<ProtectedRoute><DesertStoryListPage /></ProtectedRoute>}
        />
        <Route
          path="/desert/stories/:storyId"
          element={<ProtectedRoute><DesertStoryDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/desert/create"
          element={<ProtectedRoute><DesertStoryCreatePage /></ProtectedRoute>}
        />
        <Route
          path="/desert/preview"
          element={<ProtectedRoute><DesertStoryPreviewPage /></ProtectedRoute>}
        />
        <Route
          path="/desert/my-stories"
          element={<ProtectedRoute><DesertMyStoriesPage /></ProtectedRoute>}
        />
        <Route
          path="/desert/favorites"
          element={<ProtectedRoute><DesertFavoritesPage /></ProtectedRoute>}
        />
        <Route
          path="/home"
          element={<ProtectedRoute><HomePage /></ProtectedRoute>}
        />
        <Route
          path="/town-hall"
          element={<ProtectedRoute><TownHallPage /></ProtectedRoute>}
        />

        {/* その他のパスはトップへ */}
        <Route path="*" element={<Navigate to="/village" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
