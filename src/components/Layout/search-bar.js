import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { searchLocalMovies } from '../../features/movies/api/search-api';
import './search-bar.css';

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localResults, setLocalResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const searchLocal = async () => {
      if (searchQuery.trim().length === 0) {
        setLocalResults([]);
        setShowDropdown(false);
        return;
      }

      setShowDropdown(true);
      setIsLoading(true);
      
      try {
        const data = await searchLocalMovies(searchQuery, 1, 5);
        setLocalResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setLocalResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchLocal, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    setSearchQuery('');
    setLocalResults([]);
    setShowDropdown(false);
  };

  const handleTmdbSearch = () => {
    navigate(`/search/tmdb?query=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
    setLocalResults([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setLocalResults([]);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 3) {
      handleTmdbSearch();
    }
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      <span className="p-input-icon-left p-input-icon-right">
        <i className="pi pi-search" />
        <InputText
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.trim().length > 0 && setShowDropdown(true)}
          placeholder="Search movies..."
          style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.5rem' : '0.75rem' }}
        />
        {searchQuery && (
          <i 
            className="pi pi-times cursor-pointer" 
            onClick={handleClear}
            style={{ right: '0.75rem' }}
          />
        )}
      </span>

      {showDropdown && (
        <div className="search-results-dropdown">
          {isLoading ? (
            <div className="flex justify-content-center align-items-center py-3">
              <ProgressSpinner style={{ width: '30px', height: '30px' }} />
            </div>
          ) : (
            <>
              {localResults.length > 0 && (
                <div className="search-results-list">
                  {localResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="search-result-item"
                      onClick={() => handleMovieClick(movie.id)}
                    >
                      <img
                        src={movie.posterPath || '/placeholder-poster.png'}
                        alt={movie.title}
                        className="search-result-poster"
                        onError={(e) => {
                          e.target.src = '/placeholder-poster.png';
                        }}
                      />
                      <div className="search-result-info">
                        <div className="search-result-title">{movie.title}</div>
                        <div className="search-result-year">
                          {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery.length >= 3 && (
                <div className="tmdb-search-action">
                  <Button
                    label="Search in TMDB"
                    icon="pi pi-external-link"
                    onClick={handleTmdbSearch}
                    text
                    size="small"
                    className="w-full"
                  />
                </div>
              )}

              {searchQuery.length > 0 && searchQuery.length < 3 && !isLoading && (
                <div className="text-center py-3 text-color-secondary text-sm">
                  Type at least 3 characters
                </div>
              )}

              {searchQuery.length >= 3 && localResults.length === 0 && !isLoading && (
                <div className="text-center py-3 text-color-secondary">
                  No local results found
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
