import React, { useRef, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { MoviePoster } from './movie-poster';
import { MovieRating } from './movie-rating';
import { MovieActions } from './movie-actions';
import { MovieImages } from './movie-images';
import { MoviePublicLists } from './movie-public-lists';
import { listService } from '../api/list-api';
import { useAuth } from '../../users/context/auth-context';
import './movie-detail.css';

const formatLength = (minutes) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const formatYear = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).getFullYear();
};

export const MovieDetail = () => {
  const { id } = useParams();
  const { movie, images, loading, error } = useMovieDetails(id);
  const { isAuthenticated } = useAuth();
  const movieActionsRef = useRef(null);
  const galleryRef = useRef(null);
  const toastRef = useRef(null);
  const [movieStatusName, setMovieStatusName] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    listService.getMovieStatus(id)
      .then(data => { if (data) setMovieStatusName(data.listType?.typeName ?? null); })
      .catch(() => {});
  }, [isAuthenticated, id]);

  const handleOpenGallery = () => {
    if (!galleryRef.current?.open()) {
      toastRef.current?.show({
        severity: 'info',
        summary: 'No images',
        detail: 'There are no gallery images available for this movie.',
        life: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Message severity="error" text={error} />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="p-4">
        <Message severity="info" text="Movie not found" />
      </div>
    );
  }

  const year = formatYear(movie.releaseDate);
  const length = formatLength(movie.length);
  const language = movie.language?.toUpperCase();
  const genres = movie.genres || [];

  return (
    <div className="movie-detail-page">
      <Toast ref={toastRef} />
      <div className="movie-detail-container">
        <section className="movie-hero">
          <div className="movie-hero-info">
            <div className="movie-hero-info-top">
              <div className="movie-hero-info-text">
                <div className="movie-hero-title-row">
                  <h1 className="movie-hero-title">{movie.title}</h1>
                  {year && <span className="movie-hero-year">{year}</span>}
                </div>

                <div className="movie-hero-rating">
                  <MovieRating rating={movie.rating} voteCount={movie.voteCount} />
                </div>

                <div className="movie-hero-meta">
                  {length && (
                    <span className="movie-hero-meta-item">
                      <i className="pi pi-clock" /> {length}
                    </span>
                  )}
                  {language && (
                    <span className="movie-hero-meta-item">
                      <i className="pi pi-globe" /> {language}
                    </span>
                  )}
                </div>

                {genres.length > 0 && (
                  <div className="movie-hero-genres">
                    {genres.map((g) => (
                      <Link
                        key={g.id}
                        to={`/genres?genreIds=${g.id}`}
                        className="genre-chip-link"
                      >
                        {g.genreName}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {isAuthenticated && (
                <div className="movie-hero-actions">
                  <Button
                    label={movieStatusName ?? "Edit status"}
                    icon="pi pi-pencil"
                    className=""
                    onClick={() => movieActionsRef.current?.openEditStatusDialog()}
                  />
                  <Button
                    label="Add to list"
                    icon="pi pi-plus"
                    outlined
                    className=""
                    onClick={() => movieActionsRef.current?.openAddToListDialog()}
                  />
                </div>
              )}
            </div>

            {movie.overview && (
              <>
                <Divider />
                <div className="movie-hero-synopsis">
                  <h2 className="movie-section-title">Synopsis</h2>
                  <p className="movie-section-text">{movie.overview}</p>
                </div>
              </>
            )}
          </div>

          <div className="movie-hero-poster">
            <MoviePoster movie={movie} />
            <Button
              label="Open gallery"
              icon="pi pi-images"
              outlined
              className="movie-hero-gallery-btn"
              onClick={handleOpenGallery}
            />
          </div>
        </section>

        <MovieImages
          ref={galleryRef}
          images={images}
          posterPath={movie.posterPath}
          movieTitle={movie.title}
          headless
        />

        <MoviePublicLists movieId={movie.id} />
      </div>

      <MovieActions
        ref={movieActionsRef}
        movieId={movie.id}
        movieTitle={movie.title}
        hideQuickActions
        hideButtons
        onStatusChange={setMovieStatusName}
      />
    </div>
  );
};
