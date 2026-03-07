const API_BASE_URL = 'https://localhost:7151';

export const userService = {
  // Get all users
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
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

  // Get public lists for a specific user
  async getPublicLists(userId) {
    const response = await fetch(`${API_BASE_URL}/api/user/${userId}/lists/public`, {
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
