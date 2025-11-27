import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import { MovieCarousel } from '../features/movies/components/movie-carousel';
import { CreateCustomListForm } from '../features/movies/components/create-custom-list-form';
import { listService } from '../features/movies/api/list-api';
import { LIST_TYPES, LIST_TYPE_NAMES } from '../constants/listTypes';
import './lists-page.css';

const ListsPage = () => {
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
      await loadLists();
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

  const getListBadgeSeverity = (listTypeId) => {
    switch (listTypeId) {
      case LIST_TYPES.COMPLETED:
        return 'success';
      case LIST_TYPES.WATCHING:
        return 'info';
      case LIST_TYPES.PLANNED:
        return 'warning';
      case LIST_TYPES.DROPPED:
        return 'danger';
      case LIST_TYPES.FAVORITE:
        return 'danger';
      case LIST_TYPES.BOOKMARKED:
        return 'help';
      case LIST_TYPES.CUSTOM:
        return 'info';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <div className="lists-page-loading">
        <ProgressSpinner />
        <p>Loading your lists...</p>
      </div>
    );
  }

  return (
    <div className="lists-page">
      <div className="lists-page-header">
        <h1>My Lists</h1>
        <Button
          label="Create Custom List"
          icon="pi pi-plus"
          onClick={() => setShowCreateDialog(true)}
        />
      </div>

      {error && <Message severity="error" text={error} className="mb-3 w-full" />}

      {/* Display lists as carousels */}
      <div className="lists-page-content">
        {lists.length === 0 ? (
          <div className="lists-page-empty">
            <Message severity="info" text="You don't have any lists yet. Create one to get started!" />
          </div>
        ) : (
          lists.map((list) => (
            <div key={list.id} className="list-section">
              <div className="list-section-header">
                <div className="list-section-title">
                  <h2>{list.name}</h2>
                  <Badge 
                    value={LIST_TYPE_NAMES[list.listTypeId]} 
                    severity={getListBadgeSeverity(list.listTypeId)}
                  />
                </div>
                {list.description && (
                  <p className="list-section-description">{list.description}</p>
                )}
              </div>
              {list.listItems && list.listItems.length > 0 ? (
                <MovieCarousel 
                  movies={list.listItems.map(item => item.movie)}
                  title=""
                />
              ) : (
                <div className="list-section-empty">
                  <i className="pi pi-inbox" style={{ fontSize: '2rem', color: '#ccc' }}></i>
                  <p>No movies in this list yet</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick add predefined lists */}
      <div className="lists-page-quick-add">
        <h3>Quick Add Predefined Lists</h3>
        <div className="quick-add-buttons">
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

export default ListsPage;
