import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { InputSwitch } from 'primereact/inputswitch';
import { listService } from '../features/movies/api/list-api';
import { ListItemCard } from '../features/movies/components/list-item-card';
import { getListTypeName, LIST_TYPES } from '../constants/listTypes';
import './list-detail-page.css';

const ListDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const toast = React.useRef(null);

  const loadList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const listData = await listService.getListById(id);
      setList(listData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleteList = () => {
    confirmDialog({
      message: `Are you sure you want to delete the list "${list?.name}"? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await listService.deleteList(id);
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'List deleted successfully',
            life: 3000,
          });
          setTimeout(() => {
            navigate('/lists');
          }, 1000);
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
            life: 3000,
          });
        }
      },
    });
  };

  const handleVisibilityToggle = async (isPublic) => {
    setUpdatingVisibility(true);
    try {
      const updatedList = await listService.updateVisibility(id, isPublic);
      setList(updatedList);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `List is now ${isPublic ? 'public' : 'private'}`,
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message,
        life: 3000,
      });
    } finally {
      setUpdatingVisibility(false);
    }
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
      <div className="list-detail-page-loading">
        <ProgressSpinner />
        <p>Loading list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-detail-page">
        <Message severity="error" text={error} className="mb-3 w-full" />
        <Button
          label="Back to Lists"
          icon="pi pi-arrow-left"
          onClick={() => navigate('/lists')}
        />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="list-detail-page">
        <Message severity="warn" text="List not found" className="mb-3 w-full" />
        <Button
          label="Back to Lists"
          icon="pi pi-arrow-left"
          onClick={() => navigate('/lists')}
        />
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="list-detail-page">
        <div className="list-detail-header">
          <div className="list-detail-header-content">
            <Button
              icon="pi pi-arrow-left"
              className="p-button-text p-button-plain"
              onClick={() => navigate('/lists')}
              tooltip="Back to Lists"
            />
            <div className="list-detail-title-section">
              <div className="list-detail-title-row">
                <h1>{list.name}</h1>
                <Badge
                  value={getListTypeName(list.listTypeId)}
                  severity={getListBadgeSeverity(list.listTypeId)}
                  size="large"
                />
              </div>
              {list.description && (
                <p className="list-detail-description">{list.description}</p>
              )}
              <div className="list-detail-stats">
                <span className="list-detail-count">
                  <i className="pi pi-video" />
                  {list.listItems?.length || 0} {list.listItems?.length === 1 ? 'movie' : 'movies'}
                </span>
              </div>
            </div>
          </div>
          {list.listTypeId === LIST_TYPES.CUSTOM && (
            <div className="list-detail-actions">
              <div className="flex align-items-center gap-2 mr-3">
                <InputSwitch
                  checked={list.isPublic || false}
                  onChange={(e) => handleVisibilityToggle(e.value)}
                  disabled={updatingVisibility}
                  tooltip={list.isPublic ? 'Public list' : 'Private list'}
                />
                <span className="text-sm">
                  {list.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <Button
                label="Delete List"
                icon="pi pi-trash"
                className="p-button-danger p-button-outlined"
                onClick={handleDeleteList}
              />
            </div>
          )}
        </div>

        <div className="list-detail-content">
          {list.listItems && list.listItems.length > 0 ? (
            <div className="list-detail-movies">
              {list.listItems.map((listItem) => (
                <ListItemCard
                  key={listItem.movie.id}
                  movie={listItem.movie}
                  listId={list.id}
                  listItem={listItem}
                  onRemoved={loadList}
                />
              ))}
            </div>
          ) : (
            <div className="list-detail-empty">
              <i className="pi pi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <h3>No movies in this list yet</h3>
              <p>Start adding movies to build your collection!</p>
              <Link to="/">
                <Button label="Browse Movies" icon="pi pi-search" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ListDetailPage;
