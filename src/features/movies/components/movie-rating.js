import React from 'react';
import { Rating } from 'primereact/rating';

export const MovieRating = ({ rating, voteCount }) => {
  // Convert rating from 0-10 scale to 0-5 scale for the star display
  const starRating = rating ? Math.round(rating / 2) : 0;

  return (
    <div className="movie-rating">
      <Rating value={starRating} readOnly cancel={false} stars={5} />
      <span className="rating-text ml-2">
        {rating ? rating.toFixed(1) : 'N/A'} {voteCount && `(${voteCount.toLocaleString()} votes)`}
      </span>
    </div>
  );
};
