import api from './api';

export const authService = {
  // POST /auth/login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // GET /auth/me
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // POST /auth/register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export default authService;
