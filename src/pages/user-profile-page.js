import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { userService } from '../features/users/api/user-api';
import { followService } from '../features/users/api/follow-api';
import { useAuth } from '../features/users/context/auth-context';
import { getListTypeName, LIST_TYPES } from '../constants/listTypes';
import './user-profile-page.css';
import './my-profile-page.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const toast = useRef(null);

  const [username, setUsername] = useState(null);
  const [publicLists, setPublicLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = isAuthenticated && currentUser?.id === userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetches = [
          userService.getPublicLists(userId),
          userService.getUserById(userId),
        ];
        if (isAuthenticated && !isOwnProfile) {
          fetches.push(followService.getUserFollowStatus(userId).catch(() => null));
        }

        const results = await Promise.all(fetches);
        const [lists, userInfo, followStatus] = results;

        setPublicLists(lists);
        setUsername(userInfo.userName);

        if (followStatus) {
          setIsFollowing(followStatus.isFollowing);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, isAuthenticated, isOwnProfile]);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
        toast.current?.show({ severity: 'info', summary: 'Unfollowed', detail: `You unfollowed ${username || 'this user'}`, life: 3000 });
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
        toast.current?.show({ severity: 'success', summary: 'Following', detail: `You are now following ${username || 'this user'}`, life: 3000 });
      }
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleListClick = (listId) => {
    navigate(`/list/${listId}`);
  };

  const getInitials = (id) => `U${String(id).substring(0, 1)}`;

  const getListBadgeSeverity = (listTypeId) => {
    switch (listTypeId) {
      case LIST_TYPES.COMPLETED: return 'success';
      case LIST_TYPES.WATCHING: return 'info';
      case LIST_TYPES.PLANNED: return 'warning';
      case LIST_TYPES.DROPPED: return 'danger';
      case LIST_TYPES.FAVORITE: return 'danger';
      case LIST_TYPES.BOOKMARKED: return 'help';
      case LIST_TYPES.CUSTOM: return 'info';
      default: return 'info';
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
        <Button label="Back to Home" icon="pi pi-arrow-left" onClick={() => navigate('/')} />
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="user-profile-page">
        <div className="user-profile-header">
          <Button
            icon="pi pi-arrow-left"
            className="p-button-text p-button-plain"
            onClick={() => navigate(-1)}
            tooltip="Go back"
          />
          <div className="user-profile-info">
            <Avatar
              label={getInitials(userId)}
              size="xlarge"
              shape="circle"
              className="user-profile-avatar"
            />
            <div className="user-profile-details">
              <h1>{username || `User #${userId}`}</h1>
              {isOwnProfile && (
                <p className="user-profile-id">
                  <i className="pi pi-user mr-1" />
                  This is your profile
                </p>
              )}
            </div>
          </div>
          {isAuthenticated && !isOwnProfile && (
            <Button
              label={isFollowing ? 'Unfollow' : 'Follow'}
              icon={isFollowing ? 'pi pi-user-minus' : 'pi pi-user-plus'}
              severity={isFollowing ? 'secondary' : 'primary'}
              outlined={isFollowing}
              loading={followLoading}
              onClick={handleFollowToggle}
            />
          )}
        </div>

        <div className="user-profile-content">
          <h2 className="public-lists-title">
            <i className="pi pi-list" /> Public Lists
          </h2>

          {publicLists && publicLists.length > 0 ? (
            <div className="public-lists-grid">
              {publicLists.map((list) => {
                const posters = (list.listItems || [])
                  .map((item) => item.movie?.posterPath)
                  .filter(Boolean)
                  .slice(0, 4);
                const extra = (list.listItems?.length || 0) - posters.length;
                return (
                  <Card
                    key={list.id}
                    className="public-list-card follow-list-card"
                    onClick={() => handleListClick(list.id)}
                  >
                    <div className="follow-list-poster-strip">
                      {posters.length > 0 ? (
                        <>
                          {posters.map((path, i) => (
                            <img
                              key={i}
                              src={path}
                              alt=""
                              className="follow-list-poster"
                              loading="lazy"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ))}
                          {extra > 0 && (
                            <div className="follow-list-poster-more">+{extra}</div>
                          )}
                        </>
                      ) : (
                        <div className="follow-list-poster-empty">
                          <i className="pi pi-video" />
                        </div>
                      )}
                    </div>
                    <div className="follow-list-body">
                      <div className="follow-list-title-row">
                        <span className="follow-card-name">{list.name}</span>
                        <Badge
                          value={getListTypeName(list.listTypeId)}
                          severity={getListBadgeSeverity(list.listTypeId)}
                        />
                      </div>
                      {list.description && (
                        <p className="follow-list-description">{list.description}</p>
                      )}
                      <div className="follow-list-footer">
                        <span className="follow-list-meta">
                          <i className="pi pi-video" />
                          {list.listItems?.length || 0} {list.listItems?.length === 1 ? 'movie' : 'movies'}
                        </span>
                        <i className="pi pi-chevron-right" style={{ color: 'var(--text-color-secondary)', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                  </Card>
                );
              })}
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
    </>
  );
};

export default UserProfilePage;
