import { axiosClassic, axiosWithAuth } from "../api/interceptors";

export const subscribersService = {
  async subscribeToCompany(companyId) {
    return axiosWithAuth.post(`/subscribers/${companyId}`);
  },

  async unsubscribeFromCompany(companyId) {
    return axiosWithAuth.delete(`/subscribers/${companyId}`);
  },

  async checkSubscription(companyId) {
    return axiosWithAuth.get(`/subscribers/${companyId}/check`);
  },

  async getCompanySubscribers(companyId) {
    return axiosClassic.get(`/subscribers/company/${companyId}`);
  },

  async getUserSubscriptions() {
    return axiosWithAuth.get("/subscribers/user");
  },

  async getSubscribersCount(companyId) {
    return axiosClassic.get(`/subscribers/company/${companyId}/count`);
  },
};
