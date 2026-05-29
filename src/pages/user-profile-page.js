import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { userService } from '../features/users/api/user-api';
import { followService } from '../features/users/api/follow-api';
import { useAuth } from '../features/users/context/auth-context';
import { PublicListCard } from '../features/movies/components/public-list-card';
import { getImageUrl } from '../lib/api-client';
import { getInitials } from '../lib/utils';
import './user-profile-page.css';
import './my-profile-page.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const toast = useRef(null);

  const [userInfo, setUserInfo] = useState(null);
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

        const [lists, info, followStatus] = await Promise.all(fetches);

        setPublicLists(lists);
        setUserInfo(info);

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

  const username = userInfo?.userName || `User #${userId}`;

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
        toast.current?.show({ severity: 'info', summary: 'Unfollowed', detail: `You unfollowed ${username}`, life: 3000 });
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
        toast.current?.show({ severity: 'success', summary: 'Following', detail: `You are now following ${username}`, life: 3000 });
      }
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
    } finally {
      setFollowLoading(false);
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
      <div className="user-profile-page-wrapper">
        <div className="user-profile-banner">
          <div className="user-profile-banner-text">
            <h1>User profile</h1>
          </div>
        </div>
        <div className="user-profile-page">
          <Message severity="error" text={error} className="mb-3 w-full" />
          <Button label="Back to Home" icon="pi pi-arrow-left" onClick={() => navigate('/')} />
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page-wrapper">
      <Toast ref={toast} />

      <div className="user-profile-banner">
        <div className="user-profile-banner-text">
          <h1>{username}</h1>
          <p>{isOwnProfile ? 'This is your profile' : 'Public profile'}</p>
        </div>
        <img
          src="/jellojelly_transparent.png"
          alt="JelloMovie"
          className="user-profile-banner-logo"
        />
      </div>

      <div className="user-profile-page">
        <div className="user-profile-back">
          <Button
            icon="pi pi-arrow-left"
            label="Back"
            text
            onClick={() => navigate(-1)}
          />
        </div>

        <Card className="user-profile-hero">
          <div className="user-profile-hero-content">
            <Avatar
              image={userInfo?.profilePictureUrl ? getImageUrl(userInfo.profilePictureUrl) : undefined}
              label={userInfo?.profilePictureUrl ? undefined : getInitials(username)}
              shape="circle"
              className="user-profile-hero-avatar"
            />
            <div className="user-profile-hero-info">
              <h2 className="user-profile-hero-name">{username}</h2>
              {userInfo?.email && !isOwnProfile === false && (
                <p className="user-profile-hero-meta">
                  <i className="pi pi-envelope" /> {userInfo.email}
                </p>
              )}
              <div className="user-profile-hero-stats">
                <span className="user-profile-stat">
                  <i className="pi pi-list" /> {publicLists.length} public list{publicLists.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            {isAuthenticated && !isOwnProfile && (
              <div className="user-profile-hero-actions">
                <Button
                  label={isFollowing ? 'Following' : 'Follow'}
                  icon={isFollowing ? 'pi pi-check' : 'pi pi-user-plus'}
                  severity={isFollowing ? 'secondary' : 'primary'}
                  outlined={isFollowing}
                  loading={followLoading}
                  onClick={handleFollowToggle}
                />
              </div>
            )}
          </div>
        </Card>

        <div className="user-profile-content">
          <h2 className="public-lists-title">
            <i className="pi pi-list" /> Public lists
          </h2>

          {publicLists && publicLists.length > 0 ? (
            <div className="public-lists-grid">
              {publicLists.map((list) => (
                <PublicListCard
                  key={list.id}
                  list={list}
                  onClick={() => navigate(`/list/${list.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="public-lists-empty">
              <i className="pi pi-inbox" />
              <h3>No public lists</h3>
              <p>This user hasn't shared any lists yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
