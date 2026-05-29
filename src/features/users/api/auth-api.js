import axios from 'axios';

const authClient = axios.create({
  baseURL: 'https://localhost:7151',
  withCredentials: true,
});

export const authApi = {
  login: async (credentials) => {
    await authClient.post('/auth/login', credentials);
    return { email: credentials.email };
  },

  register: async (userData) => {
    await authClient.post('/auth/register', userData);
    return { email: userData.email, username: userData.username };
  },

  logout: async () => {
    await authClient.post('/auth/logout', {});
  },

  updateUsername: async (newUsername) => {
    await authClient.patch('/auth/username', { newUsername });
  },

  updatePassword: async (currentPassword, newPassword) => {
    await authClient.patch('/auth/password', { currentPassword, newPassword });
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await authClient.post('/auth/profile-picture', formData);
    return data;
  },
};
