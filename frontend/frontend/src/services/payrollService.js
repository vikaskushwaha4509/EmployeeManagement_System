import api from './api';

export const payrollService = {
  // GET /payrolls
  getAllPayrolls: async () => {
    const response = await api.get('/payrolls');
    return response.data;
  },

  // GET /payrolls/{id}
  getPayrollById: async (id) => {
    const response = await api.get(`/payrolls/${id}`);
    return response.data;
  },

  // POST /payrolls
  createPayroll: async (payrollData) => {
    const response = await api.post('/payrolls', payrollData);
    return response.data;
  },

  // PUT /payrolls/{id}
  updatePayroll: async (id, payrollData) => {
    const response = await api.put(`/payrolls/${id}`, payrollData);
    return response.data;
  },

  // DELETE /payrolls/{id}
  deletePayroll: async (id) => {
    const response = await api.delete(`/payrolls/${id}`);
    return response.data;
  },
};

export default payrollService;
