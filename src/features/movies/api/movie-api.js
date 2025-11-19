import { api } from '../../../lib/api-client';

export const importMovie = async (tmdbId) => {
  const response = await api.post(`/tmdb/import/${tmdbId}`);
  return response.data;
};

export const getAllMovies = async () => {
  const response = await api.get('/Movie');
  return response.data;
};

export const getMovieById = async (id) => {
  const response = await api.get(`/Movie/${id}`);
  return response.data;
};
