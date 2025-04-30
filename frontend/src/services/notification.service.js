import { axiosWithAuth } from "../api/interceptors";

export const notificationsService = {
  // Get user's notifications
  async getUserNotifications() {
    const response = await axiosWithAuth.get("/notifications");
    return response.data;
  },

  // Mark single notification as read
  async markAsRead(notificationId) {
    const response = await axiosWithAuth.put(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const response = await axiosWithAuth.put("/notifications/read-all");
    return response.data;
  },
};
