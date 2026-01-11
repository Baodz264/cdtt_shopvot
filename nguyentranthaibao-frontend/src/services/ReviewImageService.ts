import api from "./api";

export interface ReviewImagePayload {
  review_id?: number;
  image?: File | null;
}

const ReviewImageService = {
  /**
   * Lấy danh sách ảnh review (phân trang + filter review_id)
   */
  async list(params?: {
    page?: number;
    limit?: number;
    review_id?: number;
  }) {
    return api.get("/review-images", { params });
  },

  /**
   * Chi tiết ảnh review
   */
  async detail(id: number) {
    return api.get(`/review-images/${id}`);
  },

  /**
   * Upload ảnh review mới
   */
  async create(data: ReviewImagePayload) {
    const formData = new FormData();

    if (data.review_id) formData.append("review_id", data.review_id.toString());
    if (data.image) formData.append("image", data.image);

    return api.post("/review-images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Cập nhật ảnh review
   */
  async update(id: number, data: ReviewImagePayload) {
    const formData = new FormData();

    if (data.review_id)
      formData.append("review_id", data.review_id.toString());
    if (data.image) formData.append("image", data.image);

    return api.post(`/review-images/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Xóa ảnh review
   */
  async delete(id: number) {
    return api.delete(`/review-images/${id}`);
  },
};

export default ReviewImageService;
