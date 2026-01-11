import api from "./api";

export interface ReviewLikePayload {
  review_id?: number;
  user_id?: number;
  type?: "like" | "dislike";
}

const ReviewLikeService = {
  /**
   * Lấy danh sách like/dislike (phân trang + filter review_id, user_id)
   */
  async list(params?: {
    page?: number;
    limit?: number;
    review_id?: number;
    user_id?: number;
  }) {
    return api.get("/review-likes", { params });
  },

  /**
   * Chi tiết like/dislike
   */
  async detail(id: number) {
    return api.get(`/review-likes/${id}`);
  },

  /**
   * Thêm like/dislike
   */
  async create(data: ReviewLikePayload) {
    return api.post("/review-likes", data);
  },

  /**
   * Cập nhật type (like/dislike)
   */
  async update(id: number, data: Pick<ReviewLikePayload, "type">) {
    return api.put(`/review-likes/${id}`, data);
  },

  /**
   * Xóa like/dislike
   */
  async delete(id: number) {
    return api.delete(`/review-likes/${id}`);
  },
};

export default ReviewLikeService;
