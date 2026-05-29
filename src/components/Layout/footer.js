import React from 'react';
import tmdbLogo from '../../assets/tmdb-logo.svg';
import './footer.css';

export const Footer = () => (
  <footer className="app-footer">
    <div className="app-footer-inner">
      <div className="app-footer-tmdb">
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="The Movie Database"
        >
          <img
            src={tmdbLogo}
            alt="TMDB"
            className="app-footer-tmdb-logo"
          />
        </a>
        <span className="app-footer-tmdb-text">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </span>
      </div>
      <div className="app-footer-credit">
        Fehér Anna &middot; 2026 tavasz &middot; AUT &middot; Szakdolgozat
      </div>
    </div>
  </footer>
);
