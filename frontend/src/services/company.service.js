import { axiosClassic, axiosWithAuth } from "../api/interceptors";

export const companiesService = {
  async getCompanyById(id) {
    return axiosWithAuth.get(`/companies/${id}`);
  },

  async create(data) {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (key !== "logo") {
        formData.append(key, data[key]);
      }
    });

    if (data.logo) {
      formData.append("logo", data.logo);
    }

    return axiosWithAuth.post("/companies", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async checkEditPermission(companyId) {
    return axiosWithAuth.get(`/companies/${companyId}/can-edit`);
  },

  async getCompanyEvents(companyId, { status, search } = {}) {
    return axiosClassic.get(`/companies/${companyId}/events`, {
      params: { status, search },
    });
  },

  async getCompanyMembers(companyId, role) {
    return axiosClassic.get(`/companies/${companyId}/members`, {
      params: { role },
    });
  },

  async getCompanySubscribers(companyId) {
    return axiosWithAuth.get(`/companies/${companyId}/subscribers`);
  },

  async getAll() {
    return axiosClassic.get("/companies");
  },

  async getById(id) {
    return axiosClassic.get(`/companies/${id}`);
  },

  async addMember(companyId, data) {
    return axiosWithAuth.post(`/companies/${companyId}/members`, data);
  },

  async updateMemberRole(companyId, memberId, role) {
    return axiosWithAuth.patch(`/companies/${companyId}/members/${memberId}`, {
      role,
    });
  },

  async update(companyId, data) {
    return axiosWithAuth.patch(`/companies/${companyId}`, data);
  },

  async updateLogo(companyId, file) {
    const formData = new FormData();
    formData.append("file", file);

    return axiosWithAuth.post(`/companies/${companyId}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async subscribe(companyId) {
    return axiosWithAuth.post(`/companies/${companyId}/subscribe`);
  },

  async unsubscribe(companyId) {
    return axiosWithAuth.delete(`/companies/${companyId}/subscribe`);
  },

  async getUserCompanies() {
    return axiosWithAuth.get("/companies/me");
  },
};
