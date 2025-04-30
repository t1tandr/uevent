import { axiosClassic, axiosWithAuth } from "@/api/interceptors";
import { removeFromStorage, saveTokenStorage } from "./auth-token.service";

export const authService = {
  async login(data) {
    const response = await axiosClassic.post("/auth/login", data);

    if (response.data.accessToken) {
      saveTokenStorage(response.data.accessToken);
    }

    return response.data;
  },

  async register(data) {
    const response = await axiosClassic.post("/auth/register", data);

    if (response.data.accessToken) {
      saveTokenStorage(response.data.accessToken);
    }

    return response.data;
  },

  async getNewTokens() {
    const response = await axiosClassic.post("/auth/login/access-token");

    if (response.data.accessToken) {
      saveTokenStorage(response.data.accessToken);
    }

    return response.data;
  },

  async logout() {
    await axiosWithAuth.post("/auth/logout");
    removeFromStorage();
  },

  async getProfile() {
    return axiosWithAuth.get("/users/profile");
  },

  async googleAuth(accessToken) {
    if (accessToken) {
      saveTokenStorage(accessToken);
    }
  },
};
