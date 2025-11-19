import React, { useState } from 'react';
import { MovieImportForm } from '../features/movies/components/movie-import-form';
import { MovieList } from '../features/movies/components/movie-list';

const MovieImportPage = () => {
  const [movies, setMovies] = useState([]);

  const handleMovieImported = (movie) => {
    setMovies((prev) => [...prev, movie]);
  };

  return (
    <div className="p-5">
      <h2 className="mb-4">Movie Management</h2>
      <MovieImportForm onMovieImported={handleMovieImported} />
      <MovieList movies={movies} />
    </div>
  );
};

export default MovieImportPage;
