//currently not in use uses add-to-list-dialog.js

import { useState } from 'react';
import { Button } from 'primereact/button';
import { SpeedDial } from 'primereact/speeddial';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { listService } from '../api/list-api';
import { LIST_TYPES } from '../../../constants/listTypes';
import { AddToListDialog } from './add-to-list-dialog';

export const MovieListActions = ({ movieId, movieTitle }) => {
  const [showAddToListDialog, setShowAddToListDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const quickAddToList = async (listTypeId, listTypeName) => {
    setLoading(true);
    
    try {
      // First, try to get all lists to find the specific list
      const lists = await listService.getAllLists();
      const targetList = lists.find(list => list.listTypeId === listTypeId);
      
      if (!targetList) {
        // List doesn't exist, create it first
        const newList = await listService.createPredefinedList(listTypeId);
        await listService.addMovieToList(newList.id, movieId);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: `Created "${listTypeName}" list and added movie`,
          life: 3000,
        });
      } else {
        // List exists, just add the movie
        await listService.addMovieToList(targetList.id, movieId);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: `Added to "${listTypeName}"`,
          life: 3000,
        });
      }
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      label: 'Add to List',
      icon: 'pi pi-plus',
      command: () => setShowAddToListDialog(true),
    },
    {
      label: 'Mark as Completed',
      icon: 'pi pi-check-circle',
      command: () => quickAddToList(LIST_TYPES.COMPLETED, 'Completed'),
    },
    {
      label: 'Mark as Watching',
      icon: 'pi pi-eye',
      command: () => quickAddToList(LIST_TYPES.WATCHING, 'Watching'),
    },
    {
      label: 'Mark as Planned',
      icon: 'pi pi-calendar',
      command: () => quickAddToList(LIST_TYPES.PLANNED, 'Planned'),
    },
    {
      label: 'Add to Favorites',
      icon: 'pi pi-heart',
      command: () => quickAddToList(LIST_TYPES.FAVORITE, 'Favorite'),
    },
    {
      label: 'Bookmark',
      icon: 'pi pi-bookmark',
      command: () => quickAddToList(LIST_TYPES.BOOKMARKED, 'Bookmarked'),
    },
  ];

  return (
    <>
      <Toast ref={toast} />
      
      <div className="movie-list-actions">
        <SpeedDial
          model={items}
          direction="down"
          style={{ position: 'relative' }}
          buttonClassName="p-button-rounded"
          disabled={loading}
        />
      </div>

      <AddToListDialog
        visible={showAddToListDialog}
        onHide={() => setShowAddToListDialog(false)}
        movieId={movieId}
        movieTitle={movieTitle}
      />
    </>
  );
};
