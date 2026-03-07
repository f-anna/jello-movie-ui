import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Navigation } from '../components/Layout/navigation';

const HomePage = lazy(() => import('../pages/home-page'));
const MovieImportPage = lazy(() => import('../pages/movie-import-page'));
const MovieDetailPage = lazy(() => import('../pages/movie-detail-page'));
const ListsPage = lazy(() => import('../pages/lists-page'));
const ListDetailPage = lazy(() => import('../pages/list-detail-page'));
const LoginPage = lazy(() => import('../pages/login-page'));
const RegisterPage = lazy(() => import('../pages/register-page'));
const TmdbSearchPage = lazy(() => import('../pages/tmdb-search-page'));
const UserProfilePage = lazy(() => import('../pages/user-profile-page'));

function App() {
  return (
    <div className="app-container">
      <Navigation />

      <Suspense 
        fallback={
          <div className="flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <ProgressSpinner />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/import" element={<MovieImportPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/list/:id" element={<ListDetailPage />} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search/tmdb" element={<TmdbSearchPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
