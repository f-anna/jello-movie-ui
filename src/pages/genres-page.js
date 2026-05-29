import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { MovieCarousel } from '../features/movies/components/movie-carousel';
import { MovieCard } from '../features/movies/components/movie-card';
import { getAllGenres, getMoviesByGenres } from '../features/movies/api/movie-api';
import './home-page.css';
import './genres-page.css';

const DEFAULT_GENRE_NAMES = ['action', 'animation', 'comedy', 'drama', 'romance', 'horror'];
const CAROUSEL_COUNT = 20;

const GenresPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreIdsParam = searchParams.getAll('genreIds').map(Number).filter(Boolean);

  const [genres, setGenres] = useState([]);
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filteredLoading, setFilteredLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        setError(null);
        const genreList = await getAllGenres();
        setGenres(genreList);

        const defaultGenres = genreList.filter((g) =>
          DEFAULT_GENRE_NAMES.includes(g.genreName?.toLowerCase())
        );

        const results = await Promise.all(
          defaultGenres.map((genre) =>
            getMoviesByGenres([genre.id], CAROUSEL_COUNT).then((movies) => ({ id: genre.id, movies }))
          )
        );

        const map = {};
        results.forEach(({ id, movies }) => { map[id] = movies; });
        setMoviesByGenre(map);
      } catch (err) {
        setError('Failed to load genres. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    if (!genres.length) return;
    if (!genreIdsParam.length) { setSelectedGenres([]); setFilteredMovies([]); return; }
    const matched = genres.filter((g) => genreIdsParam.includes(g.id));
    setSelectedGenres(matched);
    if (matched.length) setFilterOpen(true);
  }, [genreIdsParam.join(','), genres]);

  useEffect(() => {
    if (!selectedGenres.length) { setFilteredMovies([]); return; }
    setFilteredLoading(true);
    getMoviesByGenres(selectedGenres.map((g) => g.id), 100)
      .then(setFilteredMovies)
      .catch(() => setFilteredMovies([]))
      .finally(() => setFilteredLoading(false));
  }, [selectedGenres.map((g) => g.id).join(',')]);

  const handleGenreChange = (next) => {
    setSelectedGenres(next);
    if (next.length) {
      const params = new URLSearchParams();
      next.forEach((g) => params.append('genreIds', g.id));
      setSearchParams(params);
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="home-page">
      <div className="home-page-header">
        <div className="home-hero-content">
          <h1>Browse by Genre</h1>
          <p>Find movies in your favourite category</p>
        </div>
        <img
          src="/jellojelly_transparent.png"
          alt="JelloMovie"
          className="home-page-banner-logo"
        />
      </div>

      {loading && (
        <div className="home-page-loading">
          <ProgressSpinner />
          <p>Loading genres...</p>
        </div>
      )}

      {error && !loading && (
        <div className="home-page-error">
          <Message severity="error" text={error} />
        </div>
      )}

      {!loading && !error && genres.length > 0 && (
        <div className="genres-page-filter">
          <div className="genre-filter-bar">
            <div className="genre-filter-header">
              <button
                type="button"
                className="genre-filter-toggle"
                onClick={() => setFilterOpen((v) => !v)}
                aria-expanded={filterOpen}
              >
                <i className="pi pi-tag" />
                <span>Filter by genre</span>
                {selectedGenres.length > 0 && (
                  <span className="genre-filter-count">{selectedGenres.length}</span>
                )}
                <i className={`pi ${filterOpen ? 'pi-chevron-up' : 'pi-chevron-down'} genre-filter-caret`} />
              </button>
              {selectedGenres.length > 0 && (
                <Button
                  label="Clear"
                  icon="pi pi-times"
                  size="small"
                  text
                  onClick={() => handleGenreChange([])}
                  className="genre-filter-clear"
                />
              )}
            </div>

            {filterOpen && (
              <div className="genre-filter-panel">
                <div className="genre-filter-chips">
                  {genres.map((genre) => {
                    const active = selectedGenres.some((g) => g.id === genre.id);
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        className={`genre-filter-chip${active ? ' genre-filter-chip-active' : ''}`}
                        onClick={() => {
                          const next = active
                            ? selectedGenres.filter((g) => g.id !== genre.id)
                            : [...selectedGenres, genre];
                          handleGenreChange(next);
                        }}
                      >
                        {genre.genreName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && !error && (
        selectedGenres.length > 0 ? (
          <div className="genres-page-results">
            <h2 className="genres-page-results-title">
              {selectedGenres.map((g) => g.genreName).join(' & ')}
              <span className="genres-page-results-count">
                {filteredLoading ? '' : ` — ${filteredMovies.length} movie${filteredMovies.length !== 1 ? 's' : ''}`}
              </span>
            </h2>

            {filteredLoading ? (
              <div className="flex justify-content-center p-4">
                <ProgressSpinner className="spinner-md" />
              </div>
            ) : filteredMovies.length === 0 ? (
              <Message severity="info" text="No movies match this combination of genres." />
            ) : (
              <div className="genres-page-grid">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </div>
        ) : (
          genres
            .filter((genre) => DEFAULT_GENRE_NAMES.includes(genre.genreName?.toLowerCase()))
            .filter((genre) => moviesByGenre[genre.id]?.length > 0)
            .map((genre) => (
              <MovieCarousel
                key={genre.id}
                movies={moviesByGenre[genre.id]}
                title={genre.genreName}
              />
            ))
        )
      )}
    </div>
  );
};

export default GenresPage;
