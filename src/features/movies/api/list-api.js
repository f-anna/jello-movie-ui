const API_BASE_URL = 'https://localhost:7151';

export const listService = {
  // Get all lists for current user
  async getAllLists() {
    const response = await fetch(`${API_BASE_URL}/api/list`, {
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
      throw new Error(error.message || 'Failed to fetch lists');
    }
    
    return response.json();
  },

  // Get specific list by ID
  async getListById(id) {
    const response = await fetch(`${API_BASE_URL}/api/list/${id}`, {
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
        throw new Error('List not found');
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch list');
    }
    
    return response.json();
  },

  // Get available list types
  async getListTypes() {
    const response = await fetch(`${API_BASE_URL}/api/list/types`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch list types');
    }
    
    return response.json();
  },

  // Create a new CUSTOM list
  async createCustomList(name, description = null, isPublic = false) {
    const response = await fetch(`${API_BASE_URL}/api/list`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        description: description,
        listTypeId: 1, // Custom = 1 (from ListTypeEnum)
        isPublic: isPublic,
      }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in.');
      }
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid list data');
      }
      if (response.status === 409) {
        const error = await response.json();
        throw new Error(error.message || 'List already exists');
      }
      throw new Error('Failed to create list');
    }
    
    return response.json();
  },

  // Create a predefined list (Completed, Planned, etc.)
  // Note: Each user can only have ONE of each predefined type
  async createPredefinedList(listTypeId) {
    const response = await fetch(`${API_BASE_URL}/api/list`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '', // Backend auto-generates name from type
        description: null,
        listTypeId: listTypeId,
      }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in.');
      }
      if (response.status === 409) {
        const error = await response.json();
        throw new Error(error.message || 'You already have this list type');
      }
      throw new Error('Failed to create list');
    }
    
    return response.json();
  },

  // Add movie to a list
  async addMovieToList(listId, movieId) {
    const response = await fetch(`${API_BASE_URL}/api/list/${listId}/items`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movieId }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in.');
      }
      if (response.status === 404) {
        throw new Error('List or movie not found');
      }
      if (response.status === 409) {
        const error = await response.json();
        throw new Error(error.message || 'Movie already in list');
      }
      throw new Error('Failed to add movie to list');
    }
    
    return response.json();
  },

  // Remove movie from a list
  async removeMovieFromList(listId, movieId) {
    const response = await fetch(`${API_BASE_URL}/api/list/${listId}/items/${movieId}`, {
      method: 'DELETE',
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
        throw new Error('List or movie not found');
      }
      throw new Error('Failed to remove movie from list');
    }
    
    return true;
  },

  // Delete a list
  async deleteList(listId) {
    const response = await fetch(`${API_BASE_URL}/api/List/${listId}`, {
      method: 'DELETE',
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
        throw new Error('List not found');
      }
      throw new Error('Failed to delete list');
    }
    
    return true;
  },

  // Update/add a comment to a list item
  async updateComment(listId, movieId, comment) {
    const response = await fetch(`${API_BASE_URL}/api/List/${listId}/items/${movieId}/comment`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in.');
      }
      if (response.status === 404) {
        throw new Error('List or movie not found');
      }
      throw new Error('Failed to update comment');
    }
    
    return response.json();
  },

  // Get a comment for a list item
  async getComment(listId, movieId) {
    const response = await fetch(`${API_BASE_URL}/api/List/${listId}/items/${movieId}/comment`, {
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
        throw new Error('Comment not found');
      }
      throw new Error('Failed to fetch comment');
    }
    
    return response.json();
  },

  // Delete/clear a comment from a list item
  async deleteComment(listId, movieId) {
    const response = await fetch(`${API_BASE_URL}/api/List/${listId}/items/${movieId}/comment`, {
      method: 'DELETE',
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
        throw new Error('Comment not found');
      }
      throw new Error('Failed to delete comment');
    }
    
    return true;
  },

  // Update list visibility (public/private)
  async updateVisibility(listId, isPublic) {
    const response = await fetch(`${API_BASE_URL}/api/list/${listId}/visibility`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isPublic }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in.');
      }
      if (response.status === 404) {
        throw new Error('List not found');
      }
      throw new Error('Failed to update visibility');
    }
    
    return response.json();
  },

  // Get public lists containing a specific movie
  async getPublicListsContainingMovie(movieId) {
    const response = await fetch(`${API_BASE_URL}/api/list/public/movie/${movieId}`, {
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
        throw new Error('Movie not found');
      }
      throw new Error('Failed to fetch public lists');
    }
    
    return response.json();
  },
};
