import { useState, useEffect } from 'react';
import { getMovieById, getMovieImages } from '../api/movie-api';

export const useMovieDetails = (movieId) => {
  const [movie, setMovie] = useState(null);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getMovieById(movieId);
        setMovie(data);
        
        // Fetch images if tmdbId is available
        if (data?.tmdbId) {
          try {
            const imagesData = await getMovieImages(data.tmdbId);
            setImages(imagesData);
          } catch (imgErr) {
            console.warn('Failed to fetch images:', imgErr);
            // Don't fail the whole request if images fail
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch movie details');
        console.error('Error fetching movie:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  return { movie, images, loading, error };
};
