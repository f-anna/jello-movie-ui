import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import { MovieCarousel } from '../features/movies/components/movie-carousel';
import { CreateCustomListForm } from '../features/movies/components/create-custom-list-form';
import { listService } from '../features/movies/api/list-api';
import { LIST_TYPE_NAMES, getListBadgeClassName } from '../constants/listTypes';
import './lists-page.css';

const ListsPage = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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

  const handleCustomListCreated = async () => {
    await loadLists();
  };

  return (
    <div className="lists-page-wrapper">
      <div className="lists-page-banner">
        <div className="lists-page-banner-text">
          <h1>My Lists</h1>
          <p>Track, organise, and revisit your favourite movies</p>
        </div>
        <img
          src="/jellojelly_transparent.png"
          alt="JelloMovie"
          className="lists-page-banner-logo"
        />
      </div>

      {loading ? (
        <div className="lists-page-loading">
          <ProgressSpinner />
          <p>Loading your lists...</p>
        </div>
      ) : (
        <div className="lists-page">
          <div className="lists-page-header">
            <Button
              label="Create Custom List"
              icon="pi pi-plus"
              className=""
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
                  <Link to={`/list/${list.id}`} className="list-title-link">
                    <h2>{list.name}</h2>
                  </Link>
                  <Badge
                    value={LIST_TYPE_NAMES[list.listTypeId]}
                    className={getListBadgeClassName(list.listTypeId)}
                  />
                  <Link to={`/list/${list.id}`}>
                    <Button
                      icon="pi pi-arrow-right"
                      className="p-button-text p-button-sm"
                      tooltip="View full list"
                    />
                  </Link>
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
                  <i className="pi pi-inbox empty-state-icon-sm"></i>
                  <p>No movies in this list yet</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Custom List Dialog */}
      <CreateCustomListForm
        visible={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
        onSuccess={handleCustomListCreated}
      />
        </div>
      )}
    </div>
  );
};

export default ListsPage;
