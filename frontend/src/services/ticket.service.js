import { axiosWithAuth } from "../api/interceptors";

export const ticketsService = {
  // Create new ticket
  async createTicket(data) {
    const response = await axiosWithAuth.post("/tickets", data);
    return response.data;
  },

  // Download ticket PDF
  async downloadTicketPDF(ticketId) {
    const response = await axiosWithAuth.get(`/tickets/${ticketId}/pdf`, {
      responseType: "blob",
    });

    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ticket-${ticketId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
