import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useAuth } from '../../features/users/context/auth-context';
import { SearchBar } from './search-bar';
import './navigation.css';

export const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const items = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => navigate('/'),
    },
    {
      label: 'Movies',
      icon: 'pi pi-video',
      items: [
        {
          label: 'All Movies',
          icon: 'pi pi-list',
          command: () => navigate('/'),
        },
        {
          label: 'Search in TMDB',
          icon: 'pi pi-search',
          command: () => navigate('/search/tmdb'),
        },
        {
          label: 'Import Movie',
          icon: 'pi pi-plus',
          command: () => navigate('/import'),
        },
      ],
    },
    {
      label: 'My Lists',
      icon: 'pi pi-bookmark',
      command: () => navigate('/lists'),
    },
  ];

  const start = (
    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="flex align-items-center gap-2">
        <i className="pi pi-film" style={{ fontSize: '1.5rem' }}></i>
        <span className="font-bold text-xl">JelloMovie</span>
      </div>
    </Link>
  );

  const end = (
    <div className="flex align-items-center gap-3">
      <div className="search-bar-wrapper">
        <SearchBar />
      </div>
      {isAuthenticated ? (
        <>
          <span className="text-sm text-color-secondary hidden md:inline">
            {user?.username || user?.email}
          </span>
          <Button
            label="My Profile"
            icon="pi pi-user"
            onClick={() => navigate('/my-profile')}
            severity="secondary"
            text
          />
          <Button
            label="Logout"
            icon="pi pi-sign-out"
            onClick={handleLogout}
            severity="secondary"
            text
          />
        </>
      ) : (
        <>
          <Button
            label="Login"
            icon="pi pi-sign-in"
            onClick={() => navigate('/login')}
            text
          />
          <Button
            label="Register"
            icon="pi pi-user-plus"
            onClick={() => navigate('/register')}
          />
        </>
      )}
    </div>
  );

  return <Menubar model={items} start={start} end={end} className="custom-menubar mb-4" />;
};
