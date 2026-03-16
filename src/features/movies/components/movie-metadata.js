import React from 'react';
import { Button } from 'primereact/button';
import { useAuth } from '../../users/context/auth-context';

export const MovieMetadata = ({ movie, formatDate, formatLength, onAddToList, onEditStatus }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="movie-metadata-container">
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
      {isAuthenticated && (
        <div className="metadata-actions">
          <Button
            label="Add to list"
            icon="pi pi-plus"
            onClick={onAddToList}
            outlined
            size="small"
          />
          <Button
            label="Edit status"
            icon="pi pi-pencil"
            onClick={onEditStatus}
            outlined
            size="small"
          />
        </div>
      )}
    </div>
  );
};
