const API_BASE_URL = 'https://localhost:7151';
const BASE = `${API_BASE_URL}/api/follow`;

async function handleResponse(response) {
  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // ignore parse errors, keep default message
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const followService = {
  async followUser(userId) {
    return handleResponse(await fetch(`${BASE}/users/${userId}`, { method: 'POST', credentials: 'include' }));
  },
  async unfollowUser(userId) {
    return handleResponse(await fetch(`${BASE}/users/${userId}`, { method: 'DELETE', credentials: 'include' }));
  },
  async getFollowing() {
    return handleResponse(await fetch(`${BASE}/users/following`, { credentials: 'include' }));
  },
  async getFollowers() {
    return handleResponse(await fetch(`${BASE}/users/followers`, { credentials: 'include' }));
  },
  async getUserFollowStatus(userId) {
    return handleResponse(await fetch(`${BASE}/users/${userId}/status`, { credentials: 'include' }));
  },
  async followList(listId) {
    return handleResponse(await fetch(`${BASE}/lists/${listId}`, { method: 'POST', credentials: 'include' }));
  },
  async unfollowList(listId) {
    return handleResponse(await fetch(`${BASE}/lists/${listId}`, { method: 'DELETE', credentials: 'include' }));
  },
  async getFollowedLists() {
    return handleResponse(await fetch(`${BASE}/lists`, { credentials: 'include' }));
  },
  async getListFollowStatus(listId) {
    return handleResponse(await fetch(`${BASE}/lists/${listId}/status`, { credentials: 'include' }));
  },
};
