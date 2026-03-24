import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Paginator } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { searchTmdbMovies } from '../features/movies/api/search-api';
import { importMovie, getMovieByTmdbId } from '../features/movies/api/movie-api';
import './tmdb-search-page.css';

const TmdbSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';

  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [importingIds, setImportingIds] = useState(new Set());

  const performSearch = useCallback(async (page) => {
    setIsLoading(true);
    try {
      const data = await searchTmdbMovies(query, page);
      const searchResults = data.results || [];
      
      // For imported movies, fetch their database IDs
      const resultsWithIds = await Promise.all(
        searchResults.map(async (movie) => {
          if (movie.isImported) {
            try {
              const dbMovie = await getMovieByTmdbId(movie.tmdbId);
              return { ...movie, id: dbMovie.id };
            } catch (error) {
              console.error(`Failed to fetch database ID for tmdbId ${movie.tmdbId}:`, error);
              return movie;
            }
          }
          return movie;
        })
      );
      
      setResults(resultsWithIds);
      setCurrentPage(data.page || 1);
      setTotalResults(data.totalResults || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('TMDB search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    setSearchInput(query);
    if (query.trim()) {
      performSearch(1);
    } else {
      setResults([]);
    }
  }, [query, performSearch]);

  const handlePageChange = (event) => {
    const newPage = event.page + 1; // PrimeReact uses 0-based index
    performSearch(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMovieClick = async (movie) => {
    // If movie is already imported, navigate directly
    if (movie.isImported && movie.id) {
      navigate(`/movie/${movie.id}`);
      return;
    }

    // Otherwise, import it first
    setImportingIds(prev => new Set(prev).add(movie.tmdbId));
    try {
      const importedMovie = await importMovie(movie.tmdbId);
      // Navigate to the newly imported movie
      navigate(`/movie/${importedMovie.id}`);
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setImportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(movie.tmdbId);
        return newSet;
      });
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      setSearchParams({ query: searchInput.trim() });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="tmdb-search-page">
      <div className="container mx-auto p-4">
        <div className="search-header mb-4">
          <h1 className="text-3xl font-bold mb-3">Search TMDB</h1>
          
          <div className="flex gap-2 mb-3 align-items-center">
            <span className="p-input-icon-left flex-1">
              <i className="pi pi-search" style={{ left: '0.75rem' }} />
              <InputText
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for movies..."
                className="w-full"
                style={{ paddingLeft: '2.5rem' }}
              />
            </span>
            <Button
              label="Search"
              icon="pi pi-search"
              onClick={handleSearch}
              disabled={!searchInput.trim()}
            />
          </div>

          {query && (
            <>
              <p className="text-color-secondary">
                Searching for: <strong>{query}</strong>
              </p>
              {totalResults > 0 && (
                <p className="text-sm text-color-secondary mt-2">
                  Found {totalResults} results
                </p>
              )}
            </>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <ProgressSpinner />
          </div>
        ) : results.length === 0 ? (
          <Message severity="warn" text="No results found" />
        ) : (
          <>
            <div className="tmdb-results-grid">
              {results.map((movie) => (
                <Card 
                  key={movie.tmdbId} 
                  className={`tmdb-result-card ${importingIds.has(movie.tmdbId) ? 'importing' : ''}`}
                  onClick={() => !importingIds.has(movie.tmdbId) && handleMovieClick(movie)}
                  style={{ cursor: importingIds.has(movie.tmdbId) ? 'wait' : 'pointer' }}
                >
                  <div className="tmdb-result-content">
                    <div className="tmdb-result-poster">
                      <img
                        src={movie.posterPath ?? '/placeholder-poster.png'}
                        alt={movie.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-poster.png';
                        }}
                      />
                      {importingIds.has(movie.tmdbId) && (
                        <div className="importing-overlay">
                          <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                        </div>
                      )}
                    </div>
                    
                    <div className="tmdb-result-info">
                      <h3 className="tmdb-result-title">{movie.title}</h3>
                      
                      {movie.originalTitle !== movie.title && (
                        <p className="tmdb-result-original-title">
                          {movie.originalTitle}
                        </p>
                      )}
                      
                      <div className="tmdb-result-meta">
                        {movie.releaseDate && (
                          <span className="tmdb-result-year">
                            {new Date(movie.releaseDate).getFullYear()}
                          </span>
                        )}
                        
                        {movie.voteAverage > 0 && (
                          <Tag
                            value={movie.voteAverage.toFixed(1)}
                            severity={
                              movie.voteAverage >= 7
                                ? 'success'
                                : movie.voteAverage >= 5
                                ? 'warning'
                                : 'danger'
                            }
                            icon="pi pi-star-fill"
                          />
                        )}
                      </div>

                      {movie.overview && (
                        <p className="tmdb-result-overview">
                          {movie.overview.length > 150
                            ? `${movie.overview.substring(0, 150)}...`
                            : movie.overview}
                        </p>
                      )}

                      {movie.isImported && (
                        <div className="tmdb-result-badge">
                          <Tag value="In Library" severity="info" icon="pi pi-check" />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-4">
                <Paginator
                  first={(currentPage - 1) * 20}
                  rows={20}
                  totalRecords={totalResults}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TmdbSearchPage;
