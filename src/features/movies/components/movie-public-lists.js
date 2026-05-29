import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { listService } from '../api/list-api';
import { useAuth } from '../../users/context/auth-context';
import { PublicListCard } from './public-list-card';
import './movie-public-lists.css';
import '../../../pages/my-profile-page.css';

export const MoviePublicLists = ({ movieId }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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

    if (movieId && isAuthenticated) {
      fetchPublicLists();
    } else {
      setLoading(false);
    }
  }, [movieId, isAuthenticated]);

  if (loading) {
    return (
      <div className="movie-public-lists-loading">
        <ProgressSpinner className="spinner-lg" />
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
    return null;
  }

  return (
    <div className="movie-public-lists-container">
      <h2 className="movie-public-lists-title">
        <i className="pi pi-users" /> Featured in {lists.length} public {lists.length === 1 ? 'list' : 'lists'}
      </h2>
      <div className="follow-grid follow-list-grid">
        {lists.map((list) => (
          <PublicListCard
            key={list.id}
            list={list}
            owner={list.user}
            onClick={() => navigate(`/list/${list.id}`)}
            onOwnerClick={list.user?.id ? () => navigate(`/user/${list.user.id}`) : undefined}
          />
        ))}
      </div>
    </div>
  );
};
