import axios from 'axios';

const authClient = axios.create({
  baseURL: 'https://localhost:7151',
  withCredentials: true,
});

export const authApi = {
  login: async (credentials) => {
    await authClient.post('/login', credentials);
    // email frmom credentials
    return { email: credentials.email };
  },

  register: async (userData) => {
    await authClient.post('/register', userData);
    return { email: userData.email };
  },

  logout: async () => {
    await authClient.post('/logout', {});
  },
};
