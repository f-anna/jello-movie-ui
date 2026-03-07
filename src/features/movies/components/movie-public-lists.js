import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { listService } from '../api/list-api';
import { getListTypeName, LIST_TYPES } from '../../../constants/listTypes';
import './movie-public-lists.css';

export const MoviePublicLists = ({ movieId }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicLists = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listService.getPublicListsContainingMovie(movieId);
        setLists(data);
      } catch (err) {
        console.error('Error fetching public lists:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchPublicLists();
    }
  }, [movieId]);

  const handleListClick = (listId) => {
    navigate(`/list/${listId}`);
  };

  const handleUserClick = (e, userId) => {
    e.stopPropagation();
    navigate(`/user/${userId}`);
  };

  const getInitials = (email) => {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
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

  const getMovieComment = (list) => {
    const listItem = list.listItems?.find(item => item.movieId === movieId);
    return listItem?.comment;
  };

  if (loading) {
    return (
      <div className="movie-public-lists-loading">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-public-lists-error">
        <Message severity="error" text={error} />
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <div className="movie-public-lists-empty">
        <Card>
          <div className="empty-state">
            <i className="pi pi-list" style={{ fontSize: '2rem', color: '#ccc' }}></i>
            <h3>No Public Lists</h3>
            <p>This movie hasn't been added to any public lists yet.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="movie-public-lists-container">
      <h2 className="movie-public-lists-title">
        <i className="pi pi-users" /> Featured in {lists.length} Public {lists.length === 1 ? 'List' : 'Lists'}
      </h2>
      <div className="movie-public-lists-grid">
        {lists.map((list) => {
          const comment = getMovieComment(list);
          return (
            <Card
              key={list.id}
              className="public-list-card"
              onClick={() => handleListClick(list.id)}
            >
              <div className="public-list-header">
                <div className="public-list-title-row">
                  <h3 className="public-list-name">{list.name}</h3>
                  <Badge
                    value={getListTypeName(list.listTypeId)}
                    severity={getListBadgeSeverity(list.listTypeId)}
                  />
                </div>
                
                <div 
                  className="public-list-user"
                  onClick={(e) => handleUserClick(e, list.userId)}
                >
                  <Avatar
                    label={getInitials(list.user?.email)}
                    size="normal"
                    shape="circle"
                    className="user-avatar-small"
                  />
                  <span className="user-email">{list.user?.email || 'Unknown'}</span>
                </div>
              </div>
              
              {list.description && (
                <p className="public-list-description">{list.description}</p>
              )}

              {comment && (
                <div className="list-item-comment">
                  <i className="pi pi-comment" />
                  <span>"{comment}"</span>
                </div>
              )}
              
              <div className="public-list-footer">
                <span className="public-list-count">
                  <i className="pi pi-video" />
                  {list.listItems?.length || 0} {list.listItems?.length === 1 ? 'movie' : 'movies'}
                </span>
                <i className="pi pi-chevron-right" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
