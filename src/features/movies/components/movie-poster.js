import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { listService } from '../api/list-api';
import { LIST_TYPES } from '../../../constants/listTypes';

export const MoviePoster = ({ movie }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const toast = useRef(null);

  const checkInitialStatus = useCallback(async () => {
    try {
      const lists = await listService.getAllLists();
      
      const favoriteList = lists.find(list => list.listTypeId === LIST_TYPES.FAVORITE);
      if (favoriteList && favoriteList.listItems) {
        const isInFavorites = favoriteList.listItems.some(item => item.movieId === movie.id);
        setIsFavorite(isInFavorites);
      }
      
      const bookmarkList = lists.find(list => list.listTypeId === LIST_TYPES.BOOKMARKED);
      if (bookmarkList && bookmarkList.listItems) {
        const isInBookmarks = bookmarkList.listItems.some(item => item.movieId === movie.id);
        setIsBookmarked(isInBookmarks);
      }
    } catch (err) {
      console.error('Failed to check initial status:', err);
    }
  }, [movie.id]);

  useEffect(() => {
    checkInitialStatus();
  }, [checkInitialStatus]);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      const lists = await listService.getAllLists();
      let favoriteList = lists.find(list => list.listTypeId === LIST_TYPES.FAVORITE);
      
      if (!favoriteList) {
        favoriteList = await listService.createList('Favorites', LIST_TYPES.FAVORITE);
      }

      if (isFavorite) {
        await listService.removeMovieFromList(favoriteList.id, movie.id);
        setIsFavorite(false);
        toast.current?.show({
          severity: 'info',
          summary: 'Removed',
          detail: 'Removed from favorites',
          life: 2000,
        });
      } else {
        await listService.addMovieToList(favoriteList.id, movie.id);
        setIsFavorite(true);
        toast.current?.show({
          severity: 'success',
          summary: 'Added',
          detail: 'Added to favorites',
          life: 2000,
        });
      }
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message,
        life: 3000,
      });
    }
  };

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    try {
      const lists = await listService.getAllLists();
      let bookmarkList = lists.find(list => list.listTypeId === LIST_TYPES.BOOKMARKED);
      
      if (!bookmarkList) {
        bookmarkList = await listService.createList('Bookmarked', LIST_TYPES.BOOKMARKED);
      }

      if (isBookmarked) {
        await listService.removeMovieFromList(bookmarkList.id, movie.id);
        setIsBookmarked(false);
        toast.current?.show({
          severity: 'info',
          summary: 'Removed',
          detail: 'Removed bookmark',
          life: 2000,
        });
      } else {
        await listService.addMovieToList(bookmarkList.id, movie.id);
        setIsBookmarked(true);
        toast.current?.show({
          severity: 'success',
          summary: 'Added',
          detail: 'Bookmarked',
          life: 2000,
        });
      }
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message,
        life: 3000,
      });
    }
  };

  return (
    <div className="movie-poster">
      <Toast ref={toast} />
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
      <div className="poster-quick-actions">
        <Button
          icon={isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'}
          rounded
          text
          severity={isFavorite ? 'danger' : 'secondary'}
          onClick={handleToggleFavorite}
        />
        <Button
          icon={isBookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'}
          rounded
          text
          severity={isBookmarked ? 'info' : 'secondary'}
          onClick={handleToggleBookmark}
        />
      </div>
    </div>
  );
};
