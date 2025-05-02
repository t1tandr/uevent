import { axiosWithAuth } from "../api/interceptors";

export const ticketsService = {
  async initiateTicketPurchase(eventId, promoCode) {
    try {
      const { data } = await axiosWithAuth.post("/tickets/checkout", {
        eventId,
        promoCode: promoCode || undefined,
      });
      return data;
    } catch (error) {
      console.error("Checkout error:", error.response?.data || error);
      throw error;
    }
  },

  async confirmPayment(sessionId) {
    const { data } = await axiosWithAuth.post("/tickets/confirm", {
      sessionId,
    });
    return data;
  },

  async checkEventTicket(eventId) {
    const { data } = await axiosWithAuth.get(`/tickets/check/${eventId}`);
    return data.hasTicket;
  },

  async getUserTickets() {
    const { data } = await axiosWithAuth.get("/tickets");
    console.log("Получены билеты:", data);
    return data;
  },
};
