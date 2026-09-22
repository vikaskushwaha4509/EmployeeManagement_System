import api from './api';

export const leaveService = {
  // GET /leaves
  getAllLeaves: async () => {
    const response = await api.get('/leaves');
    return response.data;
  },

  // GET /leaves/{id}
  getLeaveById: async (id) => {
    const response = await api.get(`/leaves/${id}`);
    return response.data;
  },

  // POST /leaves
  createLeave: async (leaveData) => {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  },

  // PUT /leaves/{id}
  updateLeave: async (id, leaveData) => {
    const response = await api.put(`/leaves/${id}`, leaveData);
    return response.data;
  },

  // PATCH /leaves/{id}/status?status={status}
  updateLeaveStatus: async (id, status) => {
    const response = await api.patch(`/leaves/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  // DELETE /leaves/{id}
  deleteLeave: async (id) => {
    const response = await api.delete(`/leaves/${id}`);
    return response.data;
  },
};

export default leaveService;
