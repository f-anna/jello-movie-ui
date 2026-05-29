import { useState, useEffect, useCallback, useRef } from 'react';
import { listService } from '../api/list-api';
import { LIST_TYPES } from '../../../constants/listTypes';
import { useAuth } from '../../users/context/auth-context';

const toggleListMembership = async ({ movieId, listTypeId, label, isCurrent, setIsCurrent, toast }) => {
  try {
    const lists = await listService.getAllLists();
    let list = lists.find((l) => l.listTypeId === listTypeId);
    if (!list) {
      list = await listService.createPredefinedList(listTypeId);
    }
    if (isCurrent) {
      await listService.removeMovieFromList(list.id, movieId);
      setIsCurrent(false);
      toast.current?.show({ severity: 'info', summary: 'Removed', detail: `Removed from ${label}`, life: 2000 });
    } else {
      await listService.addMovieToList(list.id, movieId);
      setIsCurrent(true);
      toast.current?.show({ severity: 'success', summary: 'Added', detail: `Added to ${label}`, life: 2000 });
    }
  } catch (err) {
    toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
  }
};

export const useFavoriteBookmark = (movieId, { enabled = true } = {}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const toast = useRef(null);
  const { isAuthenticated } = useAuth();

  const refreshStatus = useCallback(async () => {
    try {
      const lists = await listService.getAllLists();
      const fav = lists.find((l) => l.listTypeId === LIST_TYPES.FAVORITE);
      setIsFavorite(!!fav?.listItems?.some((i) => i.movieId === movieId));
      const bm = lists.find((l) => l.listTypeId === LIST_TYPES.BOOKMARKED);
      setIsBookmarked(!!bm?.listItems?.some((i) => i.movieId === movieId));
    } catch (err) {
      console.error('Failed to check initial favorite/bookmark status:', err);
    }
  }, [movieId]);

  useEffect(() => {
    if (isAuthenticated && enabled) refreshStatus();
  }, [isAuthenticated, enabled, refreshStatus]);

  const toggleFavorite = (e) => {
    e?.stopPropagation?.();
    return toggleListMembership({
      movieId,
      listTypeId: LIST_TYPES.FAVORITE,
      label: 'favorites',
      isCurrent: isFavorite,
      setIsCurrent: setIsFavorite,
      toast,
    });
  };

  const toggleBookmark = (e) => {
    e?.stopPropagation?.();
    return toggleListMembership({
      movieId,
      listTypeId: LIST_TYPES.BOOKMARKED,
      label: 'bookmarks',
      isCurrent: isBookmarked,
      setIsCurrent: setIsBookmarked,
      toast,
    });
  };

  return { isFavorite, isBookmarked, toggleFavorite, toggleBookmark, toast };
};
