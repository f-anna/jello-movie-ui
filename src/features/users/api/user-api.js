const API_BASE_URL = 'https://localhost:7151';

const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, { ...options, redirect: 'manual' });
  if (response.type === 'opaqueredirect') {
    throw Object.assign(new Error('Unauthorized. Please log in.'), { status: 401 });
  }
  return response;
};

export const userService = {
  // Get all users
  async getAllUsers() {
    const response = await apiFetch(`${API_BASE_URL}/api/user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }
    
    return response.json();
  },

  // Get current logged-in user's profile
  async getMe() {
    const response = await apiFetch(`${API_BASE_URL}/api/user/me`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized. Please log in.');
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch profile');
    }
    return response.json();
  },

  // Get a specific user by ID
  async getUserById(userId) {
    const response = await apiFetch(`${API_BASE_URL}/api/user/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized. Please log in.');
      if (response.status === 404) throw new Error('User not found');
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch user');
    }
    return response.json();
  },

  // Get public lists for a specific user
  async getPublicLists(userId) {
    const response = await apiFetch(`${API_BASE_URL}/api/user/${userId}/lists/public`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in.');
      }
      if (response.status === 404) {
        throw new Error('User not found');
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch public lists');
    }
    
    return response.json();
  },
};
