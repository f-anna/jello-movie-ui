import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ListBox } from 'primereact/listbox';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { listService } from '../api/list-api';
import { getListTypeName, LIST_TYPES } from '../../../constants/listTypes';

export const AddToListDialog = ({ visible, onHide, movieId, movieTitle }) => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (visible) {
      loadLists();
    }
  }, [visible]);

  const loadLists = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userLists = await listService.getAllLists();
      setLists(userLists);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async () => {
    if (!selectedList) {
      setError('Please select a list');
      return;
    }

    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      await listService.addMovieToList(selectedList.id, movieId);
      setSuccess(`Added "${movieTitle}" to "${selectedList.name}"`);
      
      // Close dialog after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedList(null);
    setError(null);
    setSuccess(null);
    onHide?.();
  };

  const listTemplate = (option) => {
    return (
      <div className="flex align-items-center justify-content-between">
        <div>
          <div className="font-semibold">{option.name}</div>
          <div className="text-sm text-500">
            {getListTypeName(option.listTypeId)} • {option.listItems?.length || 0} items
          </div>
        </div>
      </div>
    );
  };

  const dialogFooter = (
    <div>
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={handleClose} 
        className="p-button-text" 
        disabled={adding}
      />
      <Button 
        label={adding ? 'Adding...' : 'Add to List'} 
        icon="pi pi-plus" 
        onClick={handleAddToList}
        disabled={!selectedList || adding}
        loading={adding}
      />
    </div>
  );

  return (
    <Dialog
      header={`Add "${movieTitle}" to List`}
      visible={visible}
      className="dialog-md"
      footer={dialogFooter}
      onHide={handleClose}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center p-4">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <Message severity="error" text={error} className="mb-3 w-full" />
      ) : success ? (
        <Message severity="success" text={success} className="mb-3 w-full" />
      ) : lists.length === 0 ? (
        <Message 
          severity="info" 
          text="You don't have any lists yet. Create a list first to add movies." 
          className="w-full" 
        />
      ) : (
        <>
          {error && <Message severity="error" text={error} className="mb-3 w-full" />}
          <div className="field">
            <label className="block mb-2">Select a list:</label>
            <ListBox
              value={selectedList}
              onChange={(e) => setSelectedList(e.value)}
              options={lists}
              optionLabel="name"
              itemTemplate={listTemplate}
              className="w-full"
              listStyle={{ maxHeight: '300px' }}
            />
          </div>
        </>
      )}
    </Dialog>
  );
};
