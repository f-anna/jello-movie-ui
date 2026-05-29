import { api } from '../../../lib/api-client';

export const searchLocalMovies = async (query, page = 1, pageSize = 20) => {
  const response = await api.get('/movie/search', {
    params: { query, page, pageSize },
  });
  return response.data;
};

export const searchTmdbMovies = async (query, page = 1) => {
  const response = await api.get('/tmdb/search', {
    params: { query, page },
  });
  return response.data;
};
