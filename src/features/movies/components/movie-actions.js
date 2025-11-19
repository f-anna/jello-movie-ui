import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { ListBox } from 'primereact/listbox';
import { InputText } from 'primereact/inputtext';

//TODO: add functionality here

export const MovieActions = ({ movieId }) => {
  const [addToListVisible, setAddToListVisible] = useState(false);
  const [editStatusVisible, setEditStatusVisible] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // TODO: replace with real lists
  const userLists = [
    { label: 'Watchlist', value: 'watchlist' },
    { label: 'Favorites', value: 'favorites' },
    { label: 'To Watch', value: 'to-watch' },
  ];

  const statuses = [
    { label: 'Plan to Watch', value: 'plan-to-watch', icon: 'pi pi-calendar' },
    { label: 'Watching', value: 'watching', icon: 'pi pi-play' },
    { label: 'Completed', value: 'completed', icon: 'pi pi-check' },
    { label: 'On Hold', value: 'on-hold', icon: 'pi pi-pause' },
    { label: 'Dropped', value: 'dropped', icon: 'pi pi-times' },
  ];

  const handleAddToList = () => {
    if (selectedList || newListName) {
      const listName = newListName || selectedList.label;
      console.log('Add to list:', listName, 'for movie:', movieId);
      
      setAddToListVisible(false);
      setSelectedList(null);
      setNewListName('');
    }
  };

  const handleEditStatus = () => {
    if (selectedStatus) {
      console.log('Edit status:', selectedStatus, 'for movie:', movieId);
      
      setEditStatusVisible(false);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
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
            <Button label="Cancel" icon="pi pi-times" onClick={() => setAddToListVisible(false)} text />
            <Button 
              label="Add" 
              icon="pi pi-check" 
              onClick={handleAddToList} 
              disabled={!selectedList && !newListName}
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
            <Button label="Cancel" icon="pi pi-times" onClick={() => setEditStatusVisible(false)} text />
            <Button 
              label="Update" 
              icon="pi pi-check" 
              onClick={handleEditStatus} 
              disabled={!selectedStatus}
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
