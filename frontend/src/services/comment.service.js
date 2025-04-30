import { axiosClassic, axiosWithAuth } from "@/api/interceptors";

export const commentsService = {
  async createComment(data) {
    return axiosWithAuth.post("/comments", data);
  },

  async getEventComments(eventId) {
    return axiosClassic.get(`/comments/event/${eventId}`);
  },

  async deleteComment(commentId) {
    return axiosWithAuth.delete(`/comments/${commentId}`);
  },
};

// // Example usage in a component
// import { commentsService } from "../services/comments.service";

// // Create a comment
// const handleCreateComment = async (content, eventId, parentId = null) => {
//   try {
//     const response = await commentsService.createComment({
//       content,
//       eventId,
//       parentId
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Failed to create comment:", error);
//     throw error;
//   }
// };

// // Get event comments
// const fetchEventComments = async (eventId) => {
//   try {
//     const response = await commentsService.getEventComments(eventId);
//     return response.data;
//   } catch (error) {
//     console.error("Failed to fetch comments:", error);
//     throw error;
//   }
// };

// // Delete comment
// const handleDeleteComment = async (commentId) => {
//   try {
//     await commentsService.deleteComment(commentId);
//   } catch (error) {
//     console.error("Failed to delete comment:", error);
//     throw error;
//   }
// };
