import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Navigation } from '../components/Layout/navigation';

const HomePage = lazy(() => import('../pages/home-page'));
const MovieImportPage = lazy(() => import('../pages/movie-import-page'));
const MovieDetailPage = lazy(() => import('../pages/movie-detail-page'));
const ListsPage = lazy(() => import('../pages/lists-page'));
const LoginPage = lazy(() => import('../pages/login-page'));
const RegisterPage = lazy(() => import('../pages/register-page'));

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
