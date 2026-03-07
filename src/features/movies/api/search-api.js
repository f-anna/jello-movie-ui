import { api } from '../../../lib/api-client';

/**
 * Search movies in local database
 * @param {string} query - Search term
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Results per page (default: 20)
 * @returns {Promise} Search results with pagination
 */
export const searchLocalMovies = async (query, page = 1, pageSize = 20) => {
  const response = await api.get('/movie/search', {
    params: { query, page, pageSize },
  });
  return response.data;
};

/**
 * Search movies in TMDB
 * @param {string} query - Search term
 * @param {number} page - Page number (default: 1)
 * @returns {Promise} Search results with pagination
 */
export const searchTmdbMovies = async (query, page = 1) => {
  const response = await api.get('/tmdb/search', {
    params: { query, page },
  });
  return response.data;
};
