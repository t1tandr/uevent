import { axiosClassic } from "../api/interceptors";

export const filtersService = {
  async getAllFilters() {
    const response = await axiosClassic.get("/filters");
    return response.data;
  },

  async getFormats() {
    const response = await axiosClassic.get("/filters/formats");
    return response.data;
  },

  async getThemes() {
    const response = await axiosClassic.get("/filters/themes");
    return response.data;
  },
};
