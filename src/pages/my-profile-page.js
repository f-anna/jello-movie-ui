import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { TabView, TabPanel } from 'primereact/tabview';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from '../features/users/context/auth-context';
import { authApi } from '../features/users/api/auth-api';
import { followService } from '../features/users/api/follow-api';
import { userService } from '../features/users/api/user-api';
import { PublicListCard } from '../features/movies/components/public-list-card';
import { getImageUrl } from '../lib/api-client';
import { getInitials } from '../lib/utils';
import './my-profile-page.css';

const MyProfilePage = () => {
  const { user, updateUsername, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [pictureLoading, setPictureLoading] = useState(false);
  const [pictureError, setPictureError] = useState('');
  const [pictureSuccess, setPictureSuccess] = useState('');

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
  const [ownersById, setOwnersById] = useState({});
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
        const normalizedLists = (lists || []).map((item) => (item?.list ? item.list : item));
        setFollowedLists(normalizedLists);

        const missingOwnerIds = [
          ...new Set(
            normalizedLists
              .filter((l) => !l.user && l.userId != null)
              .map((l) => String(l.userId))
          ),
        ];
        if (missingOwnerIds.length > 0) {
          const owners = await Promise.all(
            missingOwnerIds.map((id) =>
              userService.getUserById(id).catch(() => null)
            )
          );
          const map = {};
          missingOwnerIds.forEach((id, i) => {
            if (owners[i]) map[id] = owners[i];
          });
          setOwnersById(map);
        }
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

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPictureError('Please select an image file.');
      setPictureSuccess('');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPictureError('Image must be smaller than 5 MB.');
      setPictureSuccess('');
      return;
    }

    setPictureLoading(true);
    setPictureError('');
    setPictureSuccess('');
    try {
      await authApi.uploadProfilePicture(file);
      await refreshUser();
      setPictureSuccess('Profile picture updated successfully.');
    } catch (err) {
      setPictureError(
        err.response?.data?.message || err.message || 'Failed to upload profile picture.'
      );
    } finally {
      setPictureLoading(false);
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

  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="profile-page-wrapper">
      <div className="profile-page-banner">
        <div className="profile-page-banner-text">
          <h1>My Profile</h1>
          <p>Manage your account and see who you follow</p>
        </div>
        <img
          src="/jellojelly_transparent.png"
          alt="JelloMovie"
          className="profile-page-banner-logo"
        />
      </div>

      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.profilePictureUrl ? (
              <img
                src={getImageUrl(user.profilePictureUrl)}
                alt={displayName}
                className="profile-avatar-img"
              />
            ) : (
              <i className="pi pi-user" />
            )}
          </div>
          <div className="profile-info">
            <h2>{displayName}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

      <TabView>
        <TabPanel header="Followed Lists" leftIcon="pi pi-bookmark mr-2">
          {followDataLoading ? (
            <div className="flex justify-content-center py-5">
              <ProgressSpinner className="spinner-lg" />
            </div>
          ) : followDataError ? (
            <Message severity="error" text={followDataError} className="w-full" />
          ) : followedLists.length === 0 ? (
            <div className="follow-empty">
              <i className="pi pi-bookmark empty-state-icon" />
              <p>You are not following any lists yet.</p>
            </div>
          ) : (
            <div className="follow-grid follow-list-grid">
              {followedLists.map((list) => (
                <PublicListCard
                  key={list.id}
                  list={list}
                  owner={list.user || ownersById[String(list.userId)]}
                  onClick={() => navigate(`/list/${list.id}`)}
                  footerAction={
                    <Button
                      icon="pi pi-bookmark"
                      label="Unfollow"
                      className="p-button-text p-button-sm p-button-secondary"
                      loading={unfollowingList === list.id}
                      onClick={(e) => { e.stopPropagation(); handleUnfollowList(list.id); }}
                    />
                  }
                />
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel header="Following" leftIcon="pi pi-users mr-2">
          {followDataLoading ? (
            <div className="flex justify-content-center py-5">
              <ProgressSpinner className="spinner-lg" />
            </div>
          ) : followDataError ? (
            <Message severity="error" text={followDataError} className="w-full" />
          ) : followedUsers.length === 0 ? (
            <div className="follow-empty">
              <i className="pi pi-users empty-state-icon" />
              <p>You are not following anyone yet.</p>
            </div>
          ) : (
            <div className="follow-grid">
              {followedUsers.map((u) => (
                <Card
                  key={u.id}
                  className="follow-user-card"
                  onClick={() => navigate(`/user/${u.id}`)}
                >
                  <div className="follow-user-card-header" />
                  <div className="follow-user-card-body">
                    <Avatar
                      image={u.profilePictureUrl ? getImageUrl(u.profilePictureUrl) : undefined}
                      label={u.profilePictureUrl ? undefined : getInitials(u.userName, u.email)}
                      size="xlarge"
                      shape="circle"
                      className="follow-avatar"
                    />
                    <div className="follow-user-card-info">
                      <span className="follow-card-name">{u.userName || u.email}</span>
                      {u.userName && <span className="follow-card-sub">{u.email}</span>}
                    </div>
                    <div className="follow-user-card-actions">
                      <Button
                        icon="pi pi-user"
                        label="View Profile"
                        size="small"
                        outlined
                        onClick={(e) => { e.stopPropagation(); navigate(`/user/${u.id}`); }}
                      />
                      <Button
                        icon="pi pi-user-minus"
                        label="Unfollow"
                        size="small"
                        severity="secondary"
                        text
                        loading={unfollowingUser === u.id}
                        onClick={(e) => { e.stopPropagation(); handleUnfollowUser(u.id); }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel header="Settings" leftIcon="pi pi-cog mr-2">
          <div className="settings-grid">
            <div className="settings-col">
            <Card className="settings-card settings-picture-card">
              <div className="settings-card-header">
                <i className="pi pi-image settings-card-icon" />
                <div>
                  <h3 className="settings-card-title">Profile Picture</h3>
                  <p className="settings-card-subtitle">Your avatar shown across the app.</p>
                </div>
              </div>

              {pictureError && <Message severity="error" text={pictureError} className="w-full mb-3" />}
              {pictureSuccess && <Message severity="success" text={pictureSuccess} className="w-full mb-3" />}

              <div className="settings-picture-content">
                <div className="profile-picture-preview">
                  {user?.profilePictureUrl ? (
                    <img
                      src={getImageUrl(user.profilePictureUrl)}
                      alt={displayName}
                      className="profile-picture-preview-img"
                    />
                  ) : (
                    <i className="pi pi-user" />
                  )}
                </div>
                <div className="profile-picture-actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    hidden
                  />
                  <Button
                    type="button"
                    label={user?.profilePictureUrl ? 'Change picture' : 'Upload picture'}
                    icon="pi pi-upload"
                    loading={pictureLoading}
                    onClick={() => fileInputRef.current?.click()}
                  />
                  <small className="profile-picture-hint">PNG, JPG, GIF or WebP. Max 5 MB.</small>
                </div>
              </div>
            </Card>

            <Card className="settings-card">
              <div className="settings-card-header">
                <i className="pi pi-id-card settings-card-icon" />
                <div>
                  <h3 className="settings-card-title">Username</h3>
                  <p className="settings-card-subtitle">Displayed on your profile and lists.</p>
                </div>
              </div>

                {usernameError && <Message severity="error" text={usernameError} className="w-full mb-3" />}
                {usernameSuccess && <Message severity="success" text={usernameSuccess} className="w-full mb-3" />}

                <form onSubmit={handleUsernameSubmit} className="profile-form">
                  <div className="field">
                    <label htmlFor="newUsername">New username</label>
                    <div className="profile-inline-input">
                      <InputText
                        id="newUsername"
                        value={newUsername}
                        onChange={(e) => { setNewUsername(e.target.value); setUsernameError(''); setUsernameSuccess(''); }}
                        required
                        className="w-full"
                        placeholder={user?.username || 'Enter new username'}
                      />
                      <Button
                        type="submit"
                        label="Update"
                        icon="pi pi-check"
                        loading={usernameLoading}
                        disabled={!newUsername.trim()}
                      />
                    </div>
                  </div>
                </form>
              </Card>
            </div>

            <Card className="settings-card">
              <div className="settings-card-header">
                <i className="pi pi-lock settings-card-icon" />
                  <div>
                    <h3 className="settings-card-title">Password</h3>
                    <p className="settings-card-subtitle">Keep your account secure.</p>
                  </div>
                </div>

                {passwordError && <Message severity="error" text={passwordError} className="w-full mb-3" />}
                {passwordSuccess && <Message severity="success" text={passwordSuccess} className="w-full mb-3" />}

                <form onSubmit={handlePasswordSubmit} className="profile-form">
                  <div className="field">
                    <label htmlFor="currentPassword">Current password</label>
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
                    <label htmlFor="newPassword">New password</label>
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
                    label="Update password"
                    icon="pi pi-lock"
                    loading={passwordLoading}
                    disabled={!currentPassword || !newPassword}
                  />
                </form>
              </Card>
          </div>
        </TabPanel>
      </TabView>
      </div>
    </div>
  );
};

export default MyProfilePage;
