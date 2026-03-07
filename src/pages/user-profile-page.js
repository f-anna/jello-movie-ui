import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { userService } from '../features/users/api/user-api';
import { getListTypeName, LIST_TYPES } from '../constants/listTypes';
import './user-profile-page.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [publicLists, setPublicLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's public lists
        const lists = await userService.getPublicLists(userId);
        setPublicLists(lists);
        
        // Extract user info from lists if available
        if (lists.length > 0) {
          setUser({ id: userId });
        } else {
          // If no lists, still set user with ID
          setUser({ id: userId });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleListClick = (listId) => {
    navigate(`/list/${listId}`);
  };

  const getInitials = (userId) => {
    return `U${userId.substring(0, 1)}`;
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
      <div className="user-profile-loading">
        <ProgressSpinner />
        <p>Loading user profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <Message severity="error" text={error} className="mb-3 w-full" />
        <Button
          label="Back to Home"
          icon="pi pi-arrow-left"
          onClick={() => navigate('/')}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-page">
        <Message severity="warn" text="User not found" className="mb-3 w-full" />
        <Button
          label="Back to Home"
          icon="pi pi-arrow-left"
          onClick={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="user-profile-header">
        <Button
          icon="pi pi-arrow-left"
          className="p-button-text p-button-plain"
          onClick={() => navigate('/')}
          tooltip="Back to Home"
        />
        <div className="user-profile-info">
          <Avatar
            label={getInitials(userId)}
            size="xlarge"
            shape="circle"
            className="user-profile-avatar"
          />
          <div className="user-profile-details">
            <h1>User Profile</h1>
            <p className="user-profile-id">User ID: {userId}</p>
          </div>
        </div>
      </div>

      <div className="user-profile-content">
        <h2 className="public-lists-title">
          <i className="pi pi-list" /> Public Lists
        </h2>

        {publicLists && publicLists.length > 0 ? (
          <div className="public-lists-grid">
            {publicLists.map((list) => (
              <Card
                key={list.id}
                className="public-list-card"
                onClick={() => handleListClick(list.id)}
              >
                <div className="public-list-header">
                  <h3 className="public-list-name">{list.name}</h3>
                  <Badge
                    value={getListTypeName(list.listTypeId)}
                    severity={getListBadgeSeverity(list.listTypeId)}
                  />
                </div>
                
                {list.description && (
                  <p className="public-list-description">{list.description}</p>
                )}
                
                <div className="public-list-stats">
                  <span className="public-list-count">
                    <i className="pi pi-video" />
                    {list.listItems?.length || 0} {list.listItems?.length === 1 ? 'movie' : 'movies'}
                  </span>
                  <i className="pi pi-chevron-right" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="public-lists-empty">
            <i className="pi pi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            <h3>No public lists</h3>
            <p>This user hasn't shared any lists yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
