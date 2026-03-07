import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { MovieHeader } from './movie-header';
import { MovieMetadata } from './movie-metadata';
import { MovieSynopsis } from './movie-synopsis';
import { MoviePoster } from './movie-poster';
import { MovieRating } from './movie-rating';
import { MovieActions } from './movie-actions';
import { MovieImages } from './movie-images';
import { MoviePublicLists } from './movie-public-lists';
import './movie-detail.css';

export const MovieDetail = () => {
  const { id } = useParams();
  const { movie, images, loading, error } = useMovieDetails(id);
  const movieActionsRef = useRef(null);

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

  const formatLength = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const genres = movie.genres?.map(g => g.genreName) || [];

  const handleAddToList = () => {
    movieActionsRef.current?.openAddToListDialog();
  };

  const handleEditStatus = () => {
    movieActionsRef.current?.openEditStatusDialog();
  };

  return (
    <div className="movie-detail-page">
      <div className="movie-detail-container">
        <MovieHeader 
          movie={movie} 
          formatDate={formatDate}
        />

        <div className="movie-content-grid">
          <div className="movie-info-section">
            <Card className="movie-info-card">
              <MovieMetadata 
                movie={movie} 
                formatDate={formatDate} 
                formatLength={formatLength}
                onAddToList={handleAddToList}
                onEditStatus={handleEditStatus}
              />
              
              <Divider />

              <MovieSynopsis 
                overview={movie.overview} 
                genres={genres}
                rating={movie.rating}
                voteCount={movie.voteCount}
              />
            </Card>

            <MovieImages images={images} />

            <MoviePublicLists movieId={movie.id} />
          </div>

          <div className="movie-sidebar">
            <MoviePoster movie={movie} />

            <MovieActions 
              ref={movieActionsRef}
              movieId={movie.id} 
              movieTitle={movie.title} 
              hideQuickActions 
              hideButtons
            />
          </div>
        </div>
      </div>
    </div>
  );
};
