import React from 'react';
import { Tag } from 'primereact/tag';

export const MovieHeader = ({ movie, formatDate }) => {
  return (
    <div className="movie-header">
      <div className="movie-title-section">
        <h1 className="movie-title">{movie.title}</h1>
        {movie.releaseDate && (
          <Tag 
            value={`${formatDate(movie.releaseDate)}+`} 
            severity="info" 
            rounded
            className="age-rating"
          />
        )}
      </div>
    </div>
  );
};
