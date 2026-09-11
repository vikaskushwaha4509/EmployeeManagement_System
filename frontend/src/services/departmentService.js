import api from './api';

export const departmentService = {
  // GET /departments
  getAllDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  // GET /departments/{id}
  getDepartmentById: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // POST /departments
  createDepartment: async (departmentData) => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  },

  // PUT /departments/{id}
  updateDepartment: async (id, departmentData) => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  // DELETE /departments/{id}
  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

export default departmentService;
