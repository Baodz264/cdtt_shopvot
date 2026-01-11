import api from "./api";

/**
 * Payload khi tạo / cập nhật review
 */
export interface ReviewPayload {
  user_id?: number | null;
  product_id?: number;
  rating?: number;
  content?: string | null;
  status?: "pending" | "approved" | "rejected" | null;
}

/**
 * Params khi lấy danh sách review
 */
export interface ReviewListParams {
  page?: number;
  limit?: number;
  product_id?: number;
  user_id?: number;
  min_rating?: number;
  status?: "pending" | "approved" | "rejected" | string;
  from_date?: string; // yyyy-mm-dd
  to_date?: string;   // yyyy-mm-dd
}

const ReviewService = {
  /**
   * Lấy danh sách review (phân trang + filter)
   * GET /api/reviews
   */
  list(params?: ReviewListParams) {
    return api.get("/reviews", { params });
  },

  /**
   * Thêm review mới
   * POST /api/reviews
   */
  create(data: ReviewPayload) {
    return api.post("/reviews", data);
  },

  /**
   * Lấy chi tiết review
   * GET /api/reviews/{id}
   */
  detail(id: number) {
    return api.get(`/reviews/${id}`);
  },

  /**
   * Cập nhật review
   * PUT /api/reviews/{id}
   */
  update(id: number, data: ReviewPayload) {
    return api.put(`/reviews/${id}`, data);
  },

  /**
   * Xóa review
   * DELETE /api/reviews/{id}
   */
  delete(id: number) {
    return api.delete(`/reviews/${id}`);
  },
};

export default ReviewService;
