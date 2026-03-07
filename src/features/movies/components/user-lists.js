import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import { listService } from '../api/list-api';
import { LIST_TYPES, LIST_TYPE_NAMES } from '../../../constants/listTypes';
import { CreateCustomListForm } from './create-custom-list-form';

export const UserLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingListType, setCreatingListType] = useState(null);

  useEffect(() => {
    loadLists();
  }, []);

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

  const createPredefinedList = async (listTypeId) => {
    setCreatingListType(listTypeId);
    try {
      await listService.createPredefinedList(listTypeId);
      await loadLists(); // Reload lists
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingListType(null);
    }
  };

  const handleCustomListCreated = async () => {
    await loadLists();
  };

  const hasListType = (listTypeId) => {
    return lists.some(list => list.listTypeId === listTypeId);
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (error && !lists.length) {
    return <Message severity="error" text={error} className="w-full" />;
  }

  return (
    <div className="user-lists">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>My Lists</h2>
        <Button
          label="Create Custom List"
          icon="pi pi-plus"
          onClick={() => setShowCreateDialog(true)}
        />
      </div>

      {error && <Message severity="error" text={error} className="mb-3 w-full" />}

      {/* Display existing lists */}
      <div className="grid">
        {lists.length === 0 ? (
          <div className="col-12">
            <Message severity="info" text="You don't have any lists yet. Create one to get started!" />
          </div>
        ) : (
          lists.map((list) => (
            <div key={list.id} className="col-12 md:col-6 lg:col-4">
              <Card
                title={list.name}
                subTitle={
                  <Badge 
                    value={LIST_TYPE_NAMES[list.listTypeId]} 
                    severity={list.listTypeId === LIST_TYPES.CUSTOM ? 'info' : 'success'}
                  />
                }
              >
                {list.description && (
                  <p className="mb-3">{list.description}</p>
                )}
                <div className="flex align-items-center">
                  <i className="pi pi-list mr-2"></i>
                  <span>{list.listItems?.length || 0} items</span>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Quick add predefined lists */}
      <div className="mt-5">
        <h3 className="mb-3">Quick Add Predefined Lists</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            label="Completed"
            icon="pi pi-check-circle"
            onClick={() => createPredefinedList(LIST_TYPES.COMPLETED)}
            disabled={hasListType(LIST_TYPES.COMPLETED) || creatingListType === LIST_TYPES.COMPLETED}
            loading={creatingListType === LIST_TYPES.COMPLETED}
            outlined={hasListType(LIST_TYPES.COMPLETED)}
            severity="success"
          />
          <Button
            label="Watching"
            icon="pi pi-eye"
            onClick={() => createPredefinedList(LIST_TYPES.WATCHING)}
            disabled={hasListType(LIST_TYPES.WATCHING) || creatingListType === LIST_TYPES.WATCHING}
            loading={creatingListType === LIST_TYPES.WATCHING}
            outlined={hasListType(LIST_TYPES.WATCHING)}
            severity="info"
          />
          <Button
            label="Planned"
            icon="pi pi-calendar"
            onClick={() => createPredefinedList(LIST_TYPES.PLANNED)}
            disabled={hasListType(LIST_TYPES.PLANNED) || creatingListType === LIST_TYPES.PLANNED}
            loading={creatingListType === LIST_TYPES.PLANNED}
            outlined={hasListType(LIST_TYPES.PLANNED)}
            severity="warning"
          />
          <Button
            label="Dropped"
            icon="pi pi-times-circle"
            onClick={() => createPredefinedList(LIST_TYPES.DROPPED)}
            disabled={hasListType(LIST_TYPES.DROPPED) || creatingListType === LIST_TYPES.DROPPED}
            loading={creatingListType === LIST_TYPES.DROPPED}
            outlined={hasListType(LIST_TYPES.DROPPED)}
            severity="danger"
          />
          <Button
            label="Favorite"
            icon="pi pi-heart"
            onClick={() => createPredefinedList(LIST_TYPES.FAVORITE)}
            disabled={hasListType(LIST_TYPES.FAVORITE) || creatingListType === LIST_TYPES.FAVORITE}
            loading={creatingListType === LIST_TYPES.FAVORITE}
            outlined={hasListType(LIST_TYPES.FAVORITE)}
            severity="danger"
          />
          <Button
            label="Bookmarked"
            icon="pi pi-bookmark"
            onClick={() => createPredefinedList(LIST_TYPES.BOOKMARKED)}
            disabled={hasListType(LIST_TYPES.BOOKMARKED) || creatingListType === LIST_TYPES.BOOKMARKED}
            loading={creatingListType === LIST_TYPES.BOOKMARKED}
            outlined={hasListType(LIST_TYPES.BOOKMARKED)}
            severity="help"
          />
        </div>
      </div>

      {/* Create Custom List Dialog */}
      <CreateCustomListForm
        visible={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
        onSuccess={handleCustomListCreated}
      />
    </div>
  );
};
