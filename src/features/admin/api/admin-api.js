import axios from 'axios';
import { API_HOST } from '../../../lib/api-client';

const adminClient = axios.create({
  baseURL: API_HOST,
  withCredentials: true,
});

export const adminApi = {
  deleteUser: async (userId) => {
    await adminClient.delete(`/api/admin/users/${userId}`);
  },

  deleteMovie: async (movieId) => {
    await adminClient.delete(`/api/admin/movies/${movieId}`);
  },

  deleteList: async (listId) => {
    await adminClient.delete(`/api/admin/lists/${listId}`);
  },

  getAllLists: async () => {
    const { data } = await adminClient.get('/api/list/public');
    return data;
  },

  promoteToAdmin: async (userId) => {
    await adminClient.post(`/api/admin/users/${userId}/admin`);
  },

  demoteFromAdmin: async (userId) => {
    await adminClient.delete(`/api/admin/users/${userId}/admin`);
  },

  syncTmdb: async () => {
    await adminClient.post('/api/tmdb/sync');
  },

  getSyncStatus: async () => {
    const { data } = await adminClient.get('/api/tmdb/sync/status');
    return data;
  },

  fetchRecentMovies: async () => {
    await adminClient.post('/api/tmdb/fetch-recent');
  },

  getFetchRecentStatus: async () => {
    const { data } = await adminClient.get('/api/tmdb/fetch-recent/status');
    return data;
  },
};
