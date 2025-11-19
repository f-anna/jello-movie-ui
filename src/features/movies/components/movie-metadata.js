import React from 'react';

export const MovieMetadata = ({ movie, formatDate, formatLength }) => {
  return (
    <div className="movie-metadata">
      <div className="metadata-item">
        <span className="metadata-label">Type:</span>
        <span className="metadata-value">Movie</span>
      </div>
      <div className="metadata-item">
        <span className="metadata-label">Year:</span>
        <span className="metadata-value">{formatDate(movie.releaseDate)}</span>
      </div>
      <div className="metadata-item">
        <span className="metadata-label">Length:</span>
        <span className="metadata-value">{formatLength(movie.length)}</span>
      </div>
      <div className="metadata-item">
        <span className="metadata-label">Language:</span>
        <span className="metadata-value">{movie.language?.toUpperCase() || 'N/A'}</span>
      </div>
    </div>
  );
};
