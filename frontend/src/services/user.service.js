import { axiosWithAuth } from "../api/interceptors";

export const userService = {
  async updateProfile(data) {
    const response = await axiosWithAuth.put("/user/profile", data);
    return response.data;
  },

  async updateAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosWithAuth.post("/user/update-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
