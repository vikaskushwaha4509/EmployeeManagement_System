export const authService = {
  // POST /auth/login
  login: async (credentials) => {
    return {
      token: 'ems-session',
      id: 1,
      username: credentials?.username || 'admin',
      fullName: credentials?.username ? credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1) : 'Administrator',
      email: `${credentials?.username || 'admin'}@ems.com`,
      role: 'ROLE_ADMIN',
    };
  },

  // GET /auth/me
  getCurrentUser: async () => {
    return {
      id: 1,
      username: 'admin',
      fullName: 'Administrator',
      email: 'admin@ems.com',
      role: 'ROLE_ADMIN',
    };
  },

  // POST /auth/register
  register: async (userData) => {
    return {
      id: 1,
      ...userData,
      role: 'ROLE_ADMIN',
    };
  },
};

export default authService;

