import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        friendlyMessage = 'Request timed out. Please verify your backend is responding.';
      } else {
        friendlyMessage = 'Unable to connect to backend. Please ensure Spring Boot is running on port 8080.';
      }
    } else {
      const { status, data } = error.response;
      if (typeof data === 'string' && data.trim()) {
        friendlyMessage = data;
      } else if (data && typeof data === 'object') {
        friendlyMessage = data.message || data.error || friendlyMessage;
      }

      if (status === 404 && !data?.message) {
        friendlyMessage = 'The requested resource was not found.';
      } else if (status === 400 && !data?.message) {
        friendlyMessage = 'Bad request. Please review the submitted details.';
      } else if (status === 409 && !data?.message) {
        friendlyMessage = 'Conflict error. A linked record or duplicate constraint was encountered.';
      } else if (status >= 500 && !data?.message) {
        friendlyMessage = 'Server error occurred while processing your request.';
      }
    }

    const enhancedError = new Error(friendlyMessage);
    enhancedError.originalError = error;
    enhancedError.status = error.response ? error.response.status : null;
    return Promise.reject(enhancedError);
  }
);

export default api;

