import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { followService } from '../api/follow-api';
import { useAuth } from '../context/auth-context';
import { getImageUrl } from '../../../lib/api-client';
import { getInitials } from '../../../lib/utils';
import './users-list.css';

const TOP_COUNT = 5;

export const UsersList = ({ onContentChange }) => {
  const { isAuthenticated } = useAuth();
  const [topUsers, setTopUsers] = useState([]);
  const [topLists, setTopLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchTop = async () => {
      try {
        setLoading(true);
        setError(null);
        const [users, lists] = await Promise.all([
          followService.getTopUsers(TOP_COUNT),
          followService.getTopLists(TOP_COUNT),
        ]);
        setTopUsers(users || []);
        setTopLists(lists || []);
      } catch (err) {
        console.error('Error fetching top users/lists:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTop();
  }, [isAuthenticated]);

  const hasUsers = topUsers.length > 0;
  const hasLists = topLists.length > 0;
  const hasContent = hasUsers || hasLists;

  useEffect(() => {
    if (loading) return;
    if (onContentChange) onContentChange(hasContent);
  }, [hasContent, loading, onContentChange]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="top-sidebar-loading">
        <ProgressSpinner className="spinner-sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="top-sidebar-error">
        <Message severity="error" text={error} />
      </div>
    );
  }

  if (!hasContent) return null;

  return (
    <div className="top-sidebar">
      {hasUsers && (
        <section className="top-sidebar-block">
          <h3 className="top-sidebar-title">
            <i className="pi pi-users" /> Most followed users
          </h3>
          <ul className="top-sidebar-list">
            {topUsers.map(({ user, followerCount }) => (
              <li
                key={user.id}
                className="top-sidebar-item"
                onClick={() => navigate(`/user/${user.id}`)}
              >
                <Avatar
                  image={user.profilePictureUrl ? getImageUrl(user.profilePictureUrl) : undefined}
                  label={user.profilePictureUrl ? undefined : getInitials(user.userName || user.email)}
                  shape="circle"
                  className="top-sidebar-avatar"
                />
                <div className="top-sidebar-item-text">
                  <span className="top-sidebar-item-name">{user.userName || user.email}</span>
                  <span className="top-sidebar-item-meta">
                    <i className="pi pi-user-plus" /> {followerCount ?? 0}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasLists && (
        <section className="top-sidebar-block">
          <h3 className="top-sidebar-title">
            <i className="pi pi-bookmark" /> Most followed lists
          </h3>
          <ul className="top-sidebar-list">
            {topLists.map(({ list, followerCount }) => (
              <li
                key={list.id}
                className="top-sidebar-item"
                onClick={() => navigate(`/list/${list.id}`)}
              >
                <div className="top-sidebar-list-icon">
                  <i className="pi pi-list" />
                </div>
                <div className="top-sidebar-item-text">
                  <span className="top-sidebar-item-name" title={list.name}>{list.name}</span>
                  <div className="top-sidebar-item-row">
                    {list.user?.userName && (
                      <span className="top-sidebar-item-author">
                        <i className="pi pi-user" /> {list.user.userName}
                      </span>
                    )}
                    <span className="top-sidebar-item-meta">
                      <i className="pi pi-user-plus" /> {followerCount ?? 0}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
