import React from 'react';
import { Carousel } from 'primereact/carousel';
import { MovieCard } from './movie-card';
import './movie-carousel.css';

export const MovieCarousel = ({ movies, title = 'Movies', subtitle }) => {
  const responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 5,
      numScroll: 1
    },
    {
      breakpoint: '1200px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '992px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '576px',
      numVisible: 2,
      numScroll: 1
    }
  ];

  const movieTemplate = (movie) => {
    return <MovieCard movie={movie} />;
  };

  if (!movies || movies.length === 0) {
    return (
      <div className="movie-carousel-empty">
        <i className="pi pi-film empty-state-icon"></i>
        <p>No movies available</p>
      </div>
    );
  }

  return (
    <div className="movie-carousel-container">
      <h2 className="movie-carousel-title">
        {title}
        {subtitle && (
          <>
            <i className="pi pi-angle-right movie-carousel-divider" aria-hidden="true" />
            <span className="movie-carousel-subtitle">{subtitle}</span>
          </>
        )}
      </h2>
      <Carousel
        value={movies}
        numVisible={6}
        numScroll={1}
        responsiveOptions={responsiveOptions}
        itemTemplate={movieTemplate}
        circular
        autoplayInterval={5000}
        className="movie-carousel"
      />
    </div>
  );
};
