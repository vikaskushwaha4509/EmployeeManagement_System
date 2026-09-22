import api from './api';

export const attendanceService = {
  // GET /attendance
  getAllAttendance: async () => {
    const response = await api.get('/attendance');
    return response.data;
  },

  // GET /attendance/{id}
  getAttendanceById: async (id) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },

  // POST /attendance
  createAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  // PUT /attendance/{id}
  updateAttendance: async (id, attendanceData) => {
    const response = await api.put(`/attendance/${id}`, attendanceData);
    return response.data;
  },

  // DELETE /attendance/{id}
  deleteAttendance: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
};

export default attendanceService;
