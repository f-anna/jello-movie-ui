import { api } from '../../../lib/api-client';

export const importMovie = async (tmdbId) => {
  const response = await api.post(`/tmdb/import/${tmdbId}`);
  return response.data;
};

export const getAllMovies = async () => {
  const response = await api.get('/Movie');
  return response.data;
};

export const getNewMovies = async (count) => {
  const response = await api.get('/movie/new', { params: { count } });
  return response.data;
};

export const getTrendingMovies = async (count) => {
  const response = await api.get('/movie/trending', { params: { count } });
  return response.data;
};

export const getPopularMovies = async (count) => {
  const response = await api.get('/movie/popular', { params: { count } });
  return response.data;
};

export const getMovieById = async (id) => {
  const response = await api.get(`/Movie/${id}`);
  return response.data;
};

export const getMovieImages = async (tmdbId) => {
  const response = await api.get(`/tmdb/movie/${tmdbId}/images`);
  return response.data;
};

export const getMovieByTmdbId = async (tmdbId) => {
  const response = await api.get(`/movie/tmdb/${tmdbId}`);
  return response.data;
};

export const getAllGenres = async () => {
  const response = await api.get('/genre');
  return response.data;
};

export const getMoviesByGenres = async (genreIds, count = 100) => {
  const params = new URLSearchParams();
  genreIds.forEach((id) => params.append('genreIds', id));
  params.append('count', count);
  const response = await api.get(`/genre/movies?${params.toString()}`);
  return response.data;
};
