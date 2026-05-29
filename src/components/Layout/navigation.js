import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { useAuth } from '../../features/users/context/auth-context';
import { getImageUrl } from '../../lib/api-client';
import { SearchBar } from './search-bar';
import { useHoverDropdown } from './useHoverDropdown';
import './navigation.css';

export const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const moviesDropdown = useHoverDropdown();
  const userDropdown = useHoverDropdown();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const goAndClose = (path, dropdown) => {
    navigate(path);
    dropdown.close();
    closeMobile();
  };

  const goMobile = (path) => {
    navigate(path);
    closeMobile();
  };

  const handleLogout = async () => {
    userDropdown.close();
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const moviesMenuItems = [
    { label: 'Home Page', icon: 'pi pi-home', command: () => goAndClose('/', moviesDropdown) },
    { label: 'Browse by Genre', icon: 'pi pi-tag', command: () => goAndClose('/genres', moviesDropdown) },
    { label: 'Search in TMDB', icon: 'pi pi-search', command: () => goAndClose('/search/tmdb', moviesDropdown) },
  ];

  const start = (
    <div className="nav-start">
      <Link to="/" className="nav-brand" onClick={closeMobile}>
        <img src="/jellojelly_transparent.png" alt="JelloMovie" className="nav-brand-logo" />
        <span className="font-bold text-xl">JelloMovie</span>
      </Link>
      <button
        type="button"
        className="nav-hamburger"
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((o) => !o)}
      >
        <i className={mobileOpen ? 'pi pi-times' : 'pi pi-bars'} />
      </button>
      <nav className={`nav-links${mobileOpen ? ' nav-links-open' : ''}`}>
        <div
          {...moviesDropdown.wrapperProps}
          className={`hover-menu-wrapper movies-menu-wrapper ${moviesDropdown.wrapperProps.className}`}
          tabIndex={0}
        >
          <button
            type="button"
            className="nav-link"
            onClick={() => goAndClose('/', moviesDropdown)}
          >
            <i className="pi pi-video" />
            <span>Movies</span>
            <i className="pi pi-angle-down" />
          </button>
          <Menu model={moviesMenuItems} className="hover-menu-dropdown movies-menu-dropdown" />
        </div>
        <button type="button" className="nav-link" onClick={() => goMobile('/lists')}>
          <i className="pi pi-bookmark" />
          <span>My Lists</span>
        </button>
        {user?.isAdmin && (
          <button type="button" className="nav-link" onClick={() => goMobile('/admin')}>
            <i className="pi pi-shield" />
            <span>Admin</span>
          </button>
        )}
      </nav>
    </div>
  );

  const end = (
    <div className="flex align-items-center gap-3">
      <div className="search-bar-wrapper">
        <SearchBar />
      </div>
      {isAuthenticated ? (
        <div
          {...userDropdown.wrapperProps}
          className={`hover-menu-wrapper user-menu-wrapper ${userDropdown.wrapperProps.className}`}
        >
          <Button
            onClick={() => goAndClose('/my-profile', userDropdown)}
            severity="secondary"
            text
            rounded
            aria-label={user?.username || user?.email || 'Profile'}
            className="user-menu-trigger"
          >
            {user?.profilePictureUrl ? (
              <img
                src={getImageUrl(user.profilePictureUrl)}
                alt=""
                className="nav-user-avatar"
              />
            ) : (
              <i className="pi pi-user" />
            )}
          </Button>
          <Menu
            model={[
              {
                label: 'My Profile',
                icon: 'pi pi-user',
                command: () => goAndClose('/my-profile', userDropdown),
              },
              {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: handleLogout,
              },
            ]}
            className="hover-menu-dropdown user-menu-dropdown"
          />
        </div>
      ) : (
        <>
          <Button
            label="Login"
            icon="pi pi-sign-in"
            onClick={() => navigate('/login')}
            text
            className="nav-auth-btn"
          />
          <Button
            label="Register"
            icon="pi pi-user-plus"
            onClick={() => navigate('/register')}
            className="nav-auth-btn"
          />
        </>
      )}
    </div>
  );

  return (
    <Menubar
      model={[]}
      start={start}
      end={end}
      breakpoint="1400px"
      className="custom-menubar mb-4"
    />
  );
};
