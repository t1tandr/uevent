import { axiosWithAuth } from "../api/interceptors";

export const notificationsService = {
  async getUserNotifications() {
    const response = await axiosWithAuth.get("/notifications");
    return response.data;
  },

  async markAsRead(notificationId) {
    const response = await axiosWithAuth.put(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  async markAllAsRead() {
    const response = await axiosWithAuth.put("/notifications/read-all");
    return response.data;
  },
};
