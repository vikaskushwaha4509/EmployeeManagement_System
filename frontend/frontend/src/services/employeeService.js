import api from './api';

export const employeeService = {
  // GET /employees
  getAllEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  // GET /employees/{id}
  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // POST /employees
  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // PUT /employees/{id}
  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // DELETE /employees/{id}
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

export default employeeService;
