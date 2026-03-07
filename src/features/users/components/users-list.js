import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { userService } from '../../users/api/user-api';
import './users-list.css';

export const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const getInitials = (email) => {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="users-list-loading">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-list-error">
        <Message severity="error" text={error} />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="users-list-empty">
        <Message severity="info" text="No users found" />
      </div>
    );
  }

  return (
    <div className="users-list-container">
      <h2 className="users-list-title">
        <i className="pi pi-users" /> Users
      </h2>
      <div className="users-list-grid">
        {users.map((user) => (
          <Card
            key={user.id}
            className="user-card"
            onClick={() => handleUserClick(user.id)}
          >
            <div className="user-card-content">
              <Avatar
                label={getInitials(user.email)}
                size="large"
                shape="circle"
                className="user-avatar"
              />
              <div className="user-info">
                <h3 className="user-email">{user.email}</h3>
                <span className="user-id">ID: {user.id}</span>
              </div>
              <i className="pi pi-chevron-right" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
