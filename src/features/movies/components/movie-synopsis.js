import React from 'react';
import { Tag } from 'primereact/tag';

export const MovieSynopsis = ({ overview, genres }) => {
  return (
    <>
      <div className="movie-synopsis">
        <h3>Synopsis</h3>
        <p>{overview || 'No synopsis available.'}</p>
      </div>

      <div className="movie-genres">
        {genres.map((genre, index) => (
          <Tag key={index} value={genre} rounded />
        ))}
      </div>
    </>
  );
};
