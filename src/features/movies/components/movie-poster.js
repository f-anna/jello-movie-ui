import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useAuth } from '../../users/context/auth-context';
import { getImageUrl, PLACEHOLDER_POSTER } from '../../../lib/api-client';
import { useFavoriteBookmark } from '../hooks/useFavoriteBookmark';

export const MoviePoster = ({ movie, compact = false }) => {
  const [imageError, setImageError] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isFavorite, isBookmarked, toggleFavorite, toggleBookmark, toast } =
    useFavoriteBookmark(movie.id);

  if (compact) {
    if (!isAuthenticated) return null;
    return (
      <div className="movie-quick-actions">
        <Toast ref={toast} />
        <Button
          icon={isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'}
          rounded
          outlined
          severity={isFavorite ? 'danger' : 'secondary'}
          onClick={toggleFavorite}
          tooltip={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon={isBookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'}
          rounded
          outlined
          severity={isBookmarked ? 'info' : 'secondary'}
          onClick={toggleBookmark}
          tooltip={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  }

  return (
    <div className="movie-poster">
      <Toast ref={toast} />
      <img
        src={movie.posterPath && !imageError ? getImageUrl(movie.posterPath) : PLACEHOLDER_POSTER}
        alt={movie.title}
        className="poster-image"
        onError={() => setImageError(true)}
      />
      {isAuthenticated && (
        <div className="poster-quick-actions">
          <Button
            icon={isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'}
            rounded
            text
            severity={isFavorite ? 'danger' : 'secondary'}
            onClick={toggleFavorite}
            size="small"
            tooltip={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            tooltipOptions={{ position: 'left' }}
          />
          <Button
            icon={isBookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'}
            rounded
            text
            severity={isBookmarked ? 'info' : 'secondary'}
            onClick={toggleBookmark}
            size="small"
            tooltip={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            tooltipOptions={{ position: 'left' }}
          />
        </div>
      )}
    </div>
  );
};
