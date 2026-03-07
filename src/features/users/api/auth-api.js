import axios from 'axios';

const authClient = axios.create({
  baseURL: 'https://localhost:7151',
  withCredentials: true,
});

export const authApi = {
  login: async (credentials) => {
    await authClient.post('/auth/login', credentials);
    // email frmom credentials
    return { email: credentials.email };
  },

  register: async (userData) => {
    await authClient.post('/auth/register', userData);
    return { email: userData.email };
  },

  logout: async () => {
    await authClient.post('/auth/logout', {});
  },
};
