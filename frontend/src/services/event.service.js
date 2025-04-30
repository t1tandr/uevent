import { axiosClassic, axiosWithAuth } from "../api/interceptors";

export const eventsService = {
  // Create event with images
  async create(data, images) {
    const formData = new FormData();

    // Add event data
    Object.keys(data).forEach((key) => {
      if (key === "promoCodes") {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    // Add images if they exist
    if (images?.length) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    return axiosWithAuth.post("/events", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Get all events with filters
  async getAll(filters = {}) {
    return axiosClassic.get("/events", { params: filters });
  },

  // Search events with pagination and filters
  async searchEvents(filters = {}, options = {}) {
    return axiosClassic.get("/events/search", {
      params: {
        ...filters,
        ...options,
      },
    });
  },

  // Get single event
  async getById(id) {
    return axiosClassic.get(`/events/${id}`);
  },

  // Update event images
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

  // Delete event images
  async deleteImages(eventId, imageUrls) {
    return axiosWithAuth.delete(`/events/${eventId}/images`, {
      data: { imageUrls },
    });
  },

  // Get event attendees
  async getEventAttendees(eventId, params = {}) {
    return axiosWithAuth.get(`/events/${eventId}/attendees`, {
      params,
    });
  },

  // Get attendees statistics
  async getAttendeesStatistics(eventId) {
    return axiosWithAuth.get(`/events/${eventId}/attendees/statistics`);
  },

  // Cancel event
  async cancelEvent(eventId) {
    return axiosWithAuth.post(`/events/${eventId}/cancel`);
  },

  // Promo codes management
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

  async deletePromoCode(eventId, promoCodeId) {
    return axiosWithAuth.delete(
      `/events/${eventId}/promo-codes/${promoCodeId}`
    );
  },
};
