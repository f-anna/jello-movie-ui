import { api } from '../../../lib/api-client';

export const listService = {
  async getAllLists() {
    const { data } = await api.get('/list');
    return data;
  },

  async getListById(id) {
    const { data } = await api.get(`/list/${id}`);
    return data;
  },

  async createCustomList(name, description = null, isPublic = false) {
    const { data } = await api.post('/list', {
      name,
      description,
      listTypeId: 1,
      isPublic,
    });
    return data;
  },

  async createPredefinedList(listTypeId) {
    const { data } = await api.post('/list', {
      name: '',
      description: null,
      listTypeId,
    });
    return data;
  },

  async addMovieToList(listId, movieId) {
    const { data } = await api.post(`/list/${listId}/items`, { movieId });
    return data;
  },

  async removeMovieFromList(listId, movieId) {
    await api.delete(`/list/${listId}/items/${movieId}`);
    return true;
  },

  async deleteList(listId) {
    await api.delete(`/list/${listId}`);
    return true;
  },

  async updateComment(listId, movieId, comment) {
    const { data } = await api.put(`/list/${listId}/items/${movieId}/comment`, { comment });
    return data;
  },

  async getComment(listId, movieId) {
    const { data } = await api.get(`/list/${listId}/items/${movieId}/comment`);
    return data;
  },

  async deleteComment(listId, movieId) {
    await api.delete(`/list/${listId}/items/${movieId}/comment`);
    return true;
  },

  async updateVisibility(listId, isPublic) {
    const { data } = await api.patch(`/list/${listId}/visibility`, { isPublic });
    return data;
  },

  async getPublicListsContainingMovie(movieId) {
    const { data } = await api.get(`/list/public/movie/${movieId}`);
    return data;
  },

  async getMovieStatus(movieId) {
    const { data } = await api.get(`/list/movie/${movieId}/status`);
    return data;
  },
};
