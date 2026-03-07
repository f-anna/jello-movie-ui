import React from 'react';
import { Tag } from 'primereact/tag';
import { MovieRating } from './movie-rating';

export const MovieSynopsis = ({ overview, genres, rating, voteCount }) => {
  return (
    <>
      <div className="movie-synopsis">
        <h3>Synopsis</h3>
        <p>{overview || 'No synopsis available.'}</p>
      </div>

      <div className="movie-genres-rating-wrapper">
        <div className="movie-genres">
          {genres.map((genre, index) => (
            <Tag key={index} value={genre} rounded />
          ))}
        </div>
        
        <div className="movie-rating-inline">
          <MovieRating rating={rating} voteCount={voteCount} />
        </div>
      </div>
    </>
  );
};
