import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Navigation } from '../components/Layout/navigation';
import { Footer } from '../components/Layout/footer';
import { useAuth } from '../features/users/context/auth-context';

const HIDE_FOOTER_ROUTES = ['/login', '/register'];

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return children;
};

const HomePage = lazy(() => import('../pages/home-page'));
const MovieDetailPage = lazy(() => import('../pages/movie-detail-page'));
const ListsPage = lazy(() => import('../pages/lists-page'));
const ListDetailPage = lazy(() => import('../pages/list-detail-page'));
const LoginPage = lazy(() => import('../pages/login-page'));
const RegisterPage = lazy(() => import('../pages/register-page'));
const TmdbSearchPage = lazy(() => import('../pages/tmdb-search-page'));
const GenresPage = lazy(() => import('../pages/genres-page'));
const UserProfilePage = lazy(() => import('../pages/user-profile-page'));
const MyProfilePage = lazy(() => import('../pages/my-profile-page'));
const AdminPage = lazy(() => import('../pages/admin-page'));

function App() {
  const { pathname } = useLocation();
  const showFooter = !HIDE_FOOTER_ROUTES.includes(pathname);

  return (
    <div className="app-container">
      <Navigation />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Suspense
        fallback={
          <div className="flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <ProgressSpinner />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/lists" element={<ProtectedRoute><ListsPage /></ProtectedRoute>} />
          <Route path="/list/:id" element={<ProtectedRoute><ListDetailPage /></ProtectedRoute>} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/search/tmdb" element={<TmdbSearchPage />} />
          <Route path="/genres" element={<GenresPage />} />
        </Routes>
      </Suspense>
      </div>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
