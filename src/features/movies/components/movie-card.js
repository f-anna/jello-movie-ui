import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import './movie-card.css';

export const MovieCard = ({ movie }) => {
  const posterUrl = movie.posterPath ?? '/placeholder-poster.png';

  const getRatingColor = (rating) => {
    if (rating >= 7) return 'success';
    if (rating >= 5) return 'warning';
    return 'danger';
  };

  const header = (
    <div className="movie-card-poster-container">
      <img
        src={posterUrl}
        alt={movie.title}
        className="movie-card-poster"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/placeholder-poster.png';
        }}
      />
    </div>
  );

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card-link">
      <Card 
        header={header} 
        className="movie-card"
      >
        <div className="movie-card-content">
          <h3 className="movie-card-title">{movie.title}</h3>
          {movie.releaseDate && (
            <p className="movie-card-year">
              {new Date(movie.releaseDate).getFullYear()}
            </p>
          )}
          {movie.voteAverage > 0 && (
            <div className="movie-card-rating">
              <Tag 
                value={movie.voteAverage.toFixed(1)} 
                severity={getRatingColor(movie.voteAverage)}
                icon="pi pi-star-fill"
              />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
