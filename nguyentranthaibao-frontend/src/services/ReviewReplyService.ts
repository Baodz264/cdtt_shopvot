import api from "./api";

export interface ReviewReplyPayload {
  review_id?: number;
  user_id?: number | null;
  reply?: string;
}

const ReviewReplyService = {
  /**
   * Lấy danh sách reply (phân trang + filter review_id)
   */
  async list(params?: {
    page?: number;
    limit?: number;
    review_id?: number;
  }) {
    return api.get("/review-replies", { params });
  },

  /**
   * Chi tiết một reply review
   */
  async detail(id: number) {
    return api.get(`/review-replies/${id}`);
  },

  /**
   * Tạo reply mới
   */
  async create(data: ReviewReplyPayload) {
    return api.post("/review-replies", data);
  },

  /**
   * Cập nhật reply
   */
  async update(id: number, data: ReviewReplyPayload) {
    return api.put(`/review-replies/${id}`, data);
  },

  /**
   * Xóa reply
   */
  async delete(id: number) {
    return api.delete(`/review-replies/${id}`);
  },
};

export default ReviewReplyService;
