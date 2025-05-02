import { axiosClassic, axiosWithAuth } from "../api/interceptors";

export const eventsService = {
  async create(data, images) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (images?.length) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    return axiosWithAuth.post("/events", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  async getAll(filters = {}) {
    return axiosClassic.get("/events", { params: filters });
  },

  async searchEvents(filters = {}, options = {}) {
    return axiosClassic.get("/events/search", {
      params: {
        ...filters,
        ...options,
      },
    });
  },

  async getById(id) {
    return axiosClassic.get(`/events/${id}`);
  },

  async updateImages(eventId, newImages, imagesToDelete) {
    const formData = new FormData();

    if (newImages?.length) {
      newImages.forEach((image) => {
        formData.append("images", image);
      });
    }

    if (imagesToDelete?.length) {
      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }

    return axiosWithAuth.put(`/events/${eventId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async deleteImages(eventId, imageUrls) {
    return axiosWithAuth.delete(`/events/${eventId}/images`, {
      data: { imageUrls },
    });
  },

  async getEventAttendees(eventId, params = {}) {
    return axiosWithAuth.get(`/events/${eventId}/attendees`, {
      params,
    });
  },

  async getAttendeesStatistics(eventId) {
    return axiosWithAuth.get(`/events/${eventId}/attendees/statistics`);
  },

  async cancelEvent(eventId) {
    return axiosWithAuth.post(`/events/${eventId}/cancel`);
  },

  async getEventPromoCodes(eventId) {
    return axiosWithAuth.get(`/events/${eventId}/promo-codes`);
  },

  async createPromoCode(eventId, code, discount) {
    return axiosWithAuth.post(`/events/${eventId}/promo-codes`, {
      code,
      discount,
    });
  },

  async updatePromoCode(eventId, promoCodeId, data) {
    return axiosWithAuth.patch(
      `/events/${eventId}/promo-codes/${promoCodeId}`,
      data
    );
  },

  async getUserEvents() {
    return axiosWithAuth.get("/events/user");
  },

  async deletePromoCode(eventId, promoCodeId) {
    return axiosWithAuth.delete(
      `/events/${eventId}/promo-codes/${promoCodeId}`
    );
  },
};
