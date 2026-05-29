import React, { useState, useEffect } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { MovieCarousel } from '../features/movies/components/movie-carousel';
import { UsersList } from '../features/users/components/users-list';
import { useAuth } from '../features/users/context/auth-context';
import {
  getNewMovies,
  getTrendingMovies,
  getPopularMovies,
} from '../features/movies/api/movie-api';
import './home-page.css';

const HOME_CAROUSEL_COUNT = 12;

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarHasContent, setSidebarHasContent] = useState(true);
  const [newest, setNewest] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const [newestData, trendingData, popularData] = await Promise.all([
          getNewMovies(HOME_CAROUSEL_COUNT),
          getTrendingMovies(HOME_CAROUSEL_COUNT),
          getPopularMovies(HOME_CAROUSEL_COUNT),
        ]);
        setNewest(newestData);
        setTrending(trendingData);
        setPopular(popularData);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="home-page-loading">
        <ProgressSpinner />
        <p>Loading movies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page-error">
        <Message severity="error" text={error} />
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-page-header">
        <div className="home-hero-content">
          <h1>Welcome to JelloMovie</h1>
          <p>Discover our movie collection</p>
        </div>
        <img
          src="/jellojelly_transparent.png"
          alt="JelloMovie"
          className="home-page-banner-logo"
        />
      </div>

      <div className={`home-page-body${isAuthenticated && sidebarHasContent ? '' : ' home-page-body-full'}`}>
        <div className="home-page-main">
          <MovieCarousel movies={newest} title="New" subtitle="find newest movies in JelloMovie" />
          <MovieCarousel movies={trending} title="Trending" subtitle="browse movies that others find interesting" />
          <MovieCarousel movies={popular} title="Popular" subtitle="see movies with best rating" />
        </div>

        {isAuthenticated && sidebarHasContent && (
          <aside className="home-page-sidebar">
            <UsersList onContentChange={setSidebarHasContent} />
          </aside>
        )}
      </div>
    </div>
  );
};

export default HomePage;
