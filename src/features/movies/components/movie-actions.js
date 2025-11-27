import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { ListBox } from 'primereact/listbox';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { listService } from '../api/list-api';
import { LIST_TYPES } from '../../../constants/listTypes';

export const MovieActions = ({ movieId, movieTitle }) => {
  const [addToListVisible, setAddToListVisible] = useState(false);
  const [editStatusVisible, setEditStatusVisible] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const checkInitialStatus = useCallback(async () => {
    try {
      const lists = await listService.getAllLists();
      
      // Check if movie is in favorite list
      const favoriteList = lists.find(list => list.listTypeId === LIST_TYPES.FAVORITE);
      if (favoriteList && favoriteList.listItems) {
        const isInFavorites = favoriteList.listItems.some(item => item.movieId === movieId);
        setIsFavorite(isInFavorites);
      }
      
      // Check if movie is in bookmark list
      const bookmarkList = lists.find(list => list.listTypeId === LIST_TYPES.BOOKMARKED);
      if (bookmarkList && bookmarkList.listItems) {
        const isInBookmarks = bookmarkList.listItems.some(item => item.movieId === movieId);
        setIsBookmarked(isInBookmarks);
      }
    } catch (err) {
      console.error('Failed to check initial status:', err);
      // Don't show error toast for initial check, just log it
    }
  }, [movieId]);

  useEffect(() => {
    // Check initial favorite and bookmark status
    checkInitialStatus();
  }, [checkInitialStatus]);

  useEffect(() => {
    if (addToListVisible) {
      loadLists();
    }
  }, [addToListVisible]);

  const loadLists = async () => {
    setLoading(true);
    try {
      const lists = await listService.getAllLists();
      // Filter to show only custom lists
      const customLists = lists.filter(list => list.listTypeId === LIST_TYPES.CUSTOM);
      setUserLists(customLists.map(list => ({
        label: list.name,
        value: list.id,
        listData: list
      })));
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

  const statuses = [
    { label: 'Planned', value: LIST_TYPES.PLANNED, icon: 'pi pi-calendar' },
    { label: 'Watching', value: LIST_TYPES.WATCHING, icon: 'pi pi-play' },
    { label: 'Completed', value: LIST_TYPES.COMPLETED, icon: 'pi pi-check' },
    { label: 'Dropped', value: LIST_TYPES.DROPPED, icon: 'pi pi-times' },
  ];

  const handleAddToList = async () => {
    if (!selectedList && !newListName) return;

    setLoading(true);
    try {
      let listId;
      
      if (newListName) {
        // Create new custom list
        const newList = await listService.createCustomList(newListName.trim());
        listId = newList.id;
      } else {
        // Use selected list - selectedList is the full object with { label, value, listData }
        listId = selectedList?.value || selectedList;
      }

      // Add movie to list
      await listService.addMovieToList(listId, movieId);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Added "${movieTitle}" to list`,
        life: 3000,
      });
      
      setAddToListVisible(false);
      setSelectedList(null);
      setNewListName('');
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

  const handleEditStatus = async () => {
    if (!selectedStatus) return;

    setLoading(true);
    try {
      const lists = await listService.getAllLists();
      
      // Find the target status list
      let targetList = lists.find(list => list.listTypeId === selectedStatus);
      
      // Create the list if it doesn't exist
      if (!targetList) {
        targetList = await listService.createPredefinedList(selectedStatus);
      }
      
      // Find if movie is in any other status list (excluding Custom, Favorite, Bookmarked)
      const statusListTypes = [LIST_TYPES.COMPLETED, LIST_TYPES.WATCHING, LIST_TYPES.PLANNED, LIST_TYPES.DROPPED];
      const currentStatusList = lists.find(list => 
        statusListTypes.includes(list.listTypeId) && 
        list.listTypeId !== selectedStatus &&
        list.listItems?.some(item => item.movieId === movieId)
      );
      
      // Remove from previous status list if exists
      if (currentStatusList) {
        await listService.removeMovieFromList(currentStatusList.id, movieId);
      }
      
      // Add to new status list
      await listService.addMovieToList(targetList.id, movieId);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Status updated to ${statuses.find(s => s.value === selectedStatus)?.label}`,
        life: 3000,
      });
      
      setEditStatusVisible(false);
      setSelectedStatus(null);
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

  const handleToggleFavorite = async () => {
    try {
      if (!isFavorite) {
        // Add to favorites
        const lists = await listService.getAllLists();
        let favoriteList = lists.find(list => list.listTypeId === LIST_TYPES.FAVORITE);
        
        if (!favoriteList) {
          favoriteList = await listService.createPredefinedList(LIST_TYPES.FAVORITE);
        }
        
        await listService.addMovieToList(favoriteList.id, movieId);
        setIsFavorite(true);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Added to favorites',
          life: 3000,
        });
      } else {
        // Remove from favorites
        const lists = await listService.getAllLists();
        const favoriteList = lists.find(list => list.listTypeId === LIST_TYPES.FAVORITE);
        
        if (favoriteList) {
          await listService.removeMovieFromList(favoriteList.id, movieId);
          setIsFavorite(false);
          toast.current?.show({
            severity: 'info',
            summary: 'Removed',
            detail: 'Removed from favorites',
            life: 3000,
          });
        }
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

  const handleToggleBookmark = async () => {
    try {
      if (!isBookmarked) {
        // Add to bookmarks
        const lists = await listService.getAllLists();
        let bookmarkList = lists.find(list => list.listTypeId === LIST_TYPES.BOOKMARKED);
        
        if (!bookmarkList) {
          bookmarkList = await listService.createPredefinedList(LIST_TYPES.BOOKMARKED);
        }
        
        await listService.addMovieToList(bookmarkList.id, movieId);
        setIsBookmarked(true);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Added to bookmarks',
          life: 3000,
        });
      } else {
        // Remove from bookmarks
        const lists = await listService.getAllLists();
        const bookmarkList = lists.find(list => list.listTypeId === LIST_TYPES.BOOKMARKED);
        
        if (bookmarkList) {
          await listService.removeMovieFromList(bookmarkList.id, movieId);
          setIsBookmarked(false);
          toast.current?.show({
            severity: 'info',
            summary: 'Removed',
            detail: 'Removed from bookmarks',
            life: 3000,
          });
        }
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

  const statusTemplate = (option) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className={option.icon}></i>
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <Card className="movie-actions">
        <div className="flex flex-column gap-2">
          <Button 
            label="Add to list" 
            icon="pi pi-plus" 
            className="w-full" 
            onClick={() => setAddToListVisible(true)}
            outlined
          />
          <Button 
            label="Edit status" 
            icon="pi pi-pencil" 
            className="w-full" 
            onClick={() => setEditStatusVisible(true)}
            outlined
          />
          <div className="flex align-items-center gap-2 mt-2">
            <span className="text-sm">Quick Actions:</span>
            <Button 
              icon={isFavorite ? "pi pi-heart-fill" : "pi pi-heart"} 
              rounded 
              text 
              onClick={handleToggleFavorite}
              className="p-button-sm"
              severity={isFavorite ? "danger" : "secondary"}
              tooltip="Favorite"
              tooltipOptions={{ position: 'top' }}
            />
            <Button 
              icon={isBookmarked ? "pi pi-bookmark-fill" : "pi pi-bookmark"} 
              rounded 
              text 
              onClick={handleToggleBookmark}
              className="p-button-sm"
              severity={isBookmarked ? "info" : "secondary"}
              tooltip="Bookmark"
              tooltipOptions={{ position: 'top' }}
            />
          </div>
        </div>
      </Card>

      {/* TODO: move this to different component */}
      <Dialog
        header="Add to List"
        visible={addToListVisible}
        style={{ width: '450px' }}
        onHide={() => setAddToListVisible(false)}
        footer={
          <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setAddToListVisible(false)} text disabled={loading} />
            <Button 
              label={loading ? "Adding..." : "Add"} 
              icon="pi pi-check" 
              onClick={handleAddToList} 
              disabled={(!selectedList && !newListName) || loading}
              loading={loading}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3">
          <div>
            <label htmlFor="existing-list" className="block mb-2 font-semibold">
              Select Existing List
            </label>
            <Dropdown
              id="existing-list"
              value={selectedList}
              onChange={(e) => {
                setSelectedList(e.value);
                setNewListName('');
              }}
              options={userLists}
              placeholder="Select a list"
              className="w-full"
            />
          </div>
          
          <div className="flex align-items-center gap-2">
            <div className="flex-1 border-bottom-1 border-300"></div>
            <span className="text-sm text-500">OR</span>
            <div className="flex-1 border-bottom-1 border-300"></div>
          </div>

          <div>
            <label htmlFor="new-list" className="block mb-2 font-semibold">
              Create New List
            </label>
            <InputText
              id="new-list"
              value={newListName}
              onChange={(e) => {
                setNewListName(e.target.value);
                setSelectedList(null);
              }}
              placeholder="Enter new list name"
              className="w-full"
            />
          </div>
        </div>
      </Dialog>

      {/* TODO: move this to different component */}
      <Dialog
        header="Edit Watch Status"
        visible={editStatusVisible}
        style={{ width: '400px' }}
        onHide={() => setEditStatusVisible(false)}
        footer={
          <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setEditStatusVisible(false)} text disabled={loading} />
            <Button 
              label={loading ? "Updating..." : "Update"} 
              icon="pi pi-check" 
              onClick={handleEditStatus} 
              disabled={!selectedStatus || loading}
              loading={loading}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3">
          <p className="mt-0">Select the watching status for this movie:</p>
          <ListBox
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.value)}
            options={statuses}
            itemTemplate={statusTemplate}
            className="w-full"
          />
        </div>
      </Dialog>
    </>
  );
};
