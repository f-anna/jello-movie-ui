import React from 'react';
import { Tag } from 'primereact/tag';

export const MoviePoster = ({ movie }) => {
  return (
    <div className="movie-poster">
      {movie.posterPath ? (
        <img 
          src={movie.posterPath} 
          alt={movie.title} 
          className="poster-image"
        />
      ) : (
        <div className="poster-placeholder">
          <i className="pi pi-image" style={{ fontSize: '4rem' }}></i>
        </div>
      )}
      <Tag 
        value={movie.rating ? movie.rating.toFixed(1) : 'N/A'} 
        severity="warning" 
        className="rating-badge"
      />
    </div>
  );
};
