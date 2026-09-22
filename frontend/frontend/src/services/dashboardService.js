import api from './api';

export const dashboardService = {
  // GET /summary?month={month}&year={year}
  getDashboardSummary: async (month, year) => {
    const response = await api.get('/summary', {
      params: {
        month,
        year,
      },
    });
    return response.data;
  },
};

export default dashboardService;
