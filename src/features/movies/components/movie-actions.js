import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { ListBox } from 'primereact/listbox';
import { Toast } from 'primereact/toast';
import { listService } from '../api/list-api';
import { LIST_TYPES } from '../../../constants/listTypes';
import { useAuth } from '../../users/context/auth-context';
import { CreateCustomListForm } from './create-custom-list-form';
import { useFavoriteBookmark } from '../hooks/useFavoriteBookmark';

export const MovieActions = React.forwardRef(({ movieId, movieTitle, hideQuickActions = false, hideButtons = false, onStatusChange }, ref) => {
  const [addToListVisible, setAddToListVisible] = useState(false);
  const [editStatusVisible, setEditStatusVisible] = useState(false);
  const [createListVisible, setCreateListVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [currentStatusName, setCurrentStatusName] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isFavorite, isBookmarked, toggleFavorite, toggleBookmark, toast } =
    useFavoriteBookmark(movieId, { enabled: !hideQuickActions });

  React.useImperativeHandle(ref, () => ({
    openAddToListDialog: () => setAddToListVisible(true),
    openEditStatusDialog: () => setEditStatusVisible(true)
  }));

  useEffect(() => {
    if (!isAuthenticated) return;
    listService.getMovieStatus(movieId)
      .then(data => {
        if (data) {
          setCurrentStatusName(data.listType?.typeName ?? null);
          setCurrentStatus(data.listTypeId ?? null);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, movieId]);

  useEffect(() => {
    if (addToListVisible) {
      loadLists();
    }
  }, [addToListVisible]);

  useEffect(() => {
    if (!editStatusVisible || !isAuthenticated) return;

    const loadCurrentStatus = async () => {
      try {
        const lists = await listService.getAllLists();
        const statusTypes = [LIST_TYPES.PLANNED, LIST_TYPES.WATCHING, LIST_TYPES.COMPLETED, LIST_TYPES.DROPPED];
        const match = lists.find((list) =>
          statusTypes.includes(list.listTypeId)
          && list.listItems?.some((item) => item.movieId === movieId)
        );
        const status = match ? match.listTypeId : null;
        setCurrentStatus(status);
        setSelectedStatus(status);
      } catch (err) {
        console.error('Failed to load current status:', err);
      }
    };

    loadCurrentStatus();
  }, [editStatusVisible, isAuthenticated, movieId]);

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
    if (!selectedList) return;

    setLoading(true);
    try {
      const listId = selectedList?.value || selectedList;
      await listService.addMovieToList(listId, movieId);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Added "${movieTitle}" to list`,
        life: 3000,
      });

      setAddToListVisible(false);
      setSelectedList(null);
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

  const handleListCreated = async () => {
    setCreateListVisible(false);
    await loadLists();
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
      
      const updatedLabel = statuses.find(s => s.value === selectedStatus)?.label ?? null;
      setCurrentStatus(selectedStatus);
      setCurrentStatusName(updatedLabel);
      onStatusChange?.(updatedLabel);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Status updated to ${updatedLabel}`,
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

  const statusTemplate = (option) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className={option.icon}></i>
        <span>{option.label}</span>
      </div>
    );
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Toast ref={toast} />
      {!hideButtons && (
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
              label={currentStatusName ?? "Edit status"}
              icon="pi pi-pencil"
              className="w-full"
              onClick={() => setEditStatusVisible(true)}
              outlined
            />
            {!hideQuickActions && (
              <div className="flex align-items-center gap-2 mt-2">
                <span className="text-sm">Quick Actions:</span>
                <Button
                  icon={isFavorite ? "pi pi-heart-fill" : "pi pi-heart"}
                  rounded
                  text
                  onClick={toggleFavorite}
                  className="p-button-sm"
                  severity={isFavorite ? "danger" : "secondary"}
                  tooltip="Favorite"
                  tooltipOptions={{ position: 'top' }}
                />
                <Button
                  icon={isBookmarked ? "pi pi-bookmark-fill" : "pi pi-bookmark"}
                  rounded
                  text
                  onClick={toggleBookmark}
                  className="p-button-sm"
                  severity={isBookmarked ? "info" : "secondary"}
                  tooltip="Bookmark"
                  tooltipOptions={{ position: 'top' }}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      <Dialog
        header="Add to List"
        visible={addToListVisible}
        className="dialog-md"
        onHide={() => setAddToListVisible(false)}
        footer={
          <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setAddToListVisible(false)} text disabled={loading} />
            <Button
              label={loading ? "Adding..." : "Add"}
              icon="pi pi-check"
              onClick={handleAddToList}
              disabled={!selectedList || loading}
              loading={loading}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3">
          <div>
            <label htmlFor="existing-list" className="block mb-2 font-semibold">
              Select a list
            </label>
            <Dropdown
              id="existing-list"
              value={selectedList}
              onChange={(e) => setSelectedList(e.value)}
              options={userLists}
              placeholder={userLists.length ? 'Select a list' : 'You have no custom lists yet'}
              className="w-full"
              emptyMessage="No custom lists"
            />
          </div>

          <Button
            label="Create new list"
            icon="pi pi-plus"
            onClick={() => setCreateListVisible(true)}
            outlined
            className="align-self-start"
          />
        </div>
      </Dialog>

      <CreateCustomListForm
        visible={createListVisible}
        onHide={() => setCreateListVisible(false)}
        onSuccess={handleListCreated}
      />

      <Dialog
        header="Edit Watch Status"
        visible={editStatusVisible}
        className="dialog-sm"
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
});
