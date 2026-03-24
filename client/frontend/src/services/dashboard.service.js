import api from '../api/axios';

export const dashboardService = {
  getClubs: async () => {
    const response = await api.get('/owner/clubs');
    return response.data;
  }
};
