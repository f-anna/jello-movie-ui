import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { useAuth } from '../features/users/context/auth-context';
import { authApi } from '../features/users/api/auth-api';
import './my-profile-page.css';

const MyProfilePage = () => {
  const { user, updateUsername } = useAuth();

  const [newUsername, setNewUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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
    </div>
  );
};

export default MyProfilePage;
