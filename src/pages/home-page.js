import React, { useState, useEffect } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { MovieCarousel } from '../features/movies/components/movie-carousel';
import { UsersList } from '../features/users/components/users-list';
import { getAllMovies } from '../features/movies/api/movie-api';
import './home-page.css';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllMovies();
        setMovies(data);
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
        <h1>Welcome to JelloMovie</h1>
        <p>Discover our movie collection</p>
      </div>
      
      <MovieCarousel 
        movies={movies} 
        title="All Movies" 
      />
      
      <UsersList />
    </div>
  );
};

export default HomePage;
