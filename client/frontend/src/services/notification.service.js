import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class NotificationService {
  /**
   * Fetch user notifications
   */
  async getMyNotifications() {
    try {
      const response = await axios.get(`${API_URL}/api/notifications`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Mark a notification or all notifications as read
   * @param {string} id - Optional notification ID. If not provided, marks all as read.
   */
  async markAsRead(id = null) {
    try {
      const response = await axios.patch(`${API_URL}/api/notifications`, 
        { id },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   */
  async deleteNotification(id) {
    try {
      const response = await axios.delete(`${API_URL}/api/notifications?id=${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new NotificationService();
