import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from '../features/users/context/auth-context';
import { authApi } from '../features/users/api/auth-api';
import { followService } from '../features/users/api/follow-api';
import { getListTypeName, LIST_TYPES } from '../constants/listTypes';
import './my-profile-page.css';

const MyProfilePage = () => {
  const { user, updateUsername } = useAuth();
  const navigate = useNavigate();

  const [newUsername, setNewUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [followedUsers, setFollowedUsers] = useState([]);
  const [followedLists, setFollowedLists] = useState([]);
  const [followDataLoading, setFollowDataLoading] = useState(false);
  const [followDataError, setFollowDataError] = useState(null);
  const [unfollowingUser, setUnfollowingUser] = useState(null);
  const [unfollowingList, setUnfollowingList] = useState(null);

  useEffect(() => {
    const loadFollowData = async () => {
      setFollowDataLoading(true);
      setFollowDataError(null);
      try {
        const [users, lists] = await Promise.all([
          followService.getFollowing(),
          followService.getFollowedLists(),
        ]);
        setFollowedUsers(users || []);
        setFollowedLists(lists || []);
      } catch (err) {
        setFollowDataError(err.message);
      } finally {
        setFollowDataLoading(false);
      }
    };
    loadFollowData();
  }, []);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameError('');
    setUsernameSuccess('');
    try {
      await updateUsername(newUsername.trim());
      setUsernameSuccess('Username updated successfully.');
      setNewUsername('');
    } catch (err) {
      const errors = err.response?.data;
      if (Array.isArray(errors) && errors.length > 0) {
        setUsernameError(errors.map(e => e.description).join(' '));
      } else {
        setUsernameError(err.response?.data?.message || err.message || 'Failed to update username.');
      }
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await authApi.updatePassword(currentPassword, newPassword);
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      const errors = err.response?.data;
      if (Array.isArray(errors) && errors.length > 0) {
        setPasswordError(errors.map(e => e.description).join(' '));
      } else {
        setPasswordError(err.response?.data?.message || err.message || 'Failed to update password.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUnfollowUser = async (userId) => {
    setUnfollowingUser(userId);
    try {
      await followService.unfollowUser(userId);
      setFollowedUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('Failed to unfollow user:', err);
    } finally {
      setUnfollowingUser(null);
    }
  };

  const handleUnfollowList = async (listId) => {
    setUnfollowingList(listId);
    try {
      await followService.unfollowList(listId);
      setFollowedLists((prev) => prev.filter((l) => l.id !== listId));
    } catch (err) {
      console.error('Failed to unfollow list:', err);
    } finally {
      setUnfollowingList(null);
    }
  };

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

  const getInitials = (userName, email) => {
    const name = userName || email || '?';
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <i className="pi pi-user" />
        </div>
        <div className="profile-info">
          <h2>{displayName}</h2>
          <p>{user?.email}</p>
        </div>
      </div>

      <TabView>
        <TabPanel header="Settings" leftIcon="pi pi-cog mr-2">
          <Card className="profile-section">
            <h3 className="profile-section-title">
              <i className="pi pi-id-card" />
              Change Username
            </h3>

            {usernameError && <Message severity="error" text={usernameError} className="w-full mb-3" />}
            {usernameSuccess && <Message severity="success" text={usernameSuccess} className="w-full mb-3" />}

            <form onSubmit={handleUsernameSubmit} className="profile-form">
              <div className="field">
                <label htmlFor="newUsername">New Username</label>
                <InputText
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => { setNewUsername(e.target.value); setUsernameError(''); setUsernameSuccess(''); }}
                  required
                  className="w-full"
                  placeholder={user?.username || 'Enter new username'}
                />
              </div>
              <Button
                type="submit"
                label="Update Username"
                icon="pi pi-check"
                loading={usernameLoading}
                disabled={!newUsername.trim()}
              />
            </form>

            <Divider />

            <h3 className="profile-section-title">
              <i className="pi pi-lock" />
              Change Password
            </h3>

            {passwordError && <Message severity="error" text={passwordError} className="w-full mb-3" />}
            {passwordSuccess && <Message severity="success" text={passwordSuccess} className="w-full mb-3" />}

            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="field">
                <label htmlFor="currentPassword">Current Password</label>
                <Password
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); setPasswordSuccess(''); }}
                  feedback={false}
                  toggleMask
                  required
                  className="w-full"
                  inputClassName="w-full"
                  placeholder="Enter current password"
                />
              </div>
              <div className="field">
                <label htmlFor="newPassword">New Password</label>
                <Password
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); setPasswordSuccess(''); }}
                  toggleMask
                  required
                  className="w-full"
                  inputClassName="w-full"
                  placeholder="Enter new password"
                />
              </div>
              <Button
                type="submit"
                label="Update Password"
                icon="pi pi-lock"
                loading={passwordLoading}
                disabled={!currentPassword || !newPassword}
              />
            </form>
          </Card>
        </TabPanel>

        <TabPanel header="Following" leftIcon="pi pi-users mr-2">
          {followDataLoading ? (
            <div className="flex justify-content-center py-5">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            </div>
          ) : followDataError ? (
            <Message severity="error" text={followDataError} className="w-full" />
          ) : followedUsers.length === 0 ? (
            <div className="follow-empty">
              <i className="pi pi-users" style={{ fontSize: '3rem', color: '#ccc' }} />
              <p>You are not following anyone yet.</p>
            </div>
          ) : (
            <div className="follow-grid">
              {followedUsers.map((u) => (
                <Card key={u.id} className="follow-user-card">
                  <div className="follow-user-card-header" />
                  <div className="follow-user-card-body">
                    <Avatar
                      label={getInitials(u.userName, u.email)}
                      size="xlarge"
                      shape="circle"
                      className="follow-avatar"
                    />
                    <div className="follow-user-card-info">
                      <span className="follow-card-name">{u.userName || u.email}</span>
                      {u.userName && <span className="follow-card-sub">{u.email}</span>}
                    </div>
                    <Tag
                      icon="pi pi-users"
                      value="Following"
                      severity="success"
                      className="follow-user-tag"
                    />
                    <div className="follow-user-card-actions">
                      <Button
                        icon="pi pi-user"
                        label="View Profile"
                        size="small"
                        outlined
                        onClick={() => navigate(`/user/${u.id}`)}
                      />
                      <Button
                        icon="pi pi-user-minus"
                        label="Unfollow"
                        size="small"
                        severity="secondary"
                        text
                        loading={unfollowingUser === u.id}
                        onClick={() => handleUnfollowUser(u.id)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel header="Followed Lists" leftIcon="pi pi-bookmark mr-2">
          {followDataLoading ? (
            <div className="flex justify-content-center py-5">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            </div>
          ) : followDataError ? (
            <Message severity="error" text={followDataError} className="w-full" />
          ) : followedLists.length === 0 ? (
            <div className="follow-empty">
              <i className="pi pi-bookmark" style={{ fontSize: '3rem', color: '#ccc' }} />
              <p>You are not following any lists yet.</p>
            </div>
          ) : (
            <div className="follow-grid follow-list-grid">
              {followedLists.map((list) => {
                const posters = (list.listItems || [])
                  .map((item) => item.movie?.posterPath)
                  .filter(Boolean)
                  .slice(0, 4);
                const extra = (list.listItems?.length || 0) - posters.length;
                return (
                  <Card
                    key={list.id}
                    className="follow-card follow-list-card"
                    onClick={() => navigate(`/list/${list.id}`)}
                  >
                    <div className="follow-list-poster-strip">
                      {posters.length > 0 ? (
                        <>
                          {posters.map((path, i) => (
                            <img
                              key={i}
                              src={`https://image.tmdb.org/t/p/w154${path}`}
                              alt=""
                              className="follow-list-poster"
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
                      <span className="follow-list-owner">
                        <Avatar
                          label={getInitials(list.user?.userName, null)}
                          size="small"
                          shape="circle"
                          className="follow-list-owner-avatar"
                        />
                        {list.user?.userName || 'Unknown'}
                      </span>
                      {list.description && (
                        <p className="follow-list-description">{list.description}</p>
                      )}
                      <div className="follow-list-footer">
                        <span className="follow-list-meta">
                          <i className="pi pi-video" />
                          {list.listItems?.length || 0} {list.listItems?.length === 1 ? 'movie' : 'movies'}
                        </span>
                        <Button
                          icon="pi pi-bookmark"
                          label="Unfollow"
                          className="p-button-text p-button-sm p-button-secondary"
                          loading={unfollowingList === list.id}
                          onClick={(e) => { e.stopPropagation(); handleUnfollowList(list.id); }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabPanel>
      </TabView>
    </div>
  );
};

export default MyProfilePage;
