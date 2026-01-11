// services/ProductNewService.ts
import api from "./api";

/**
 * Payload thêm / cập nhật sản phẩm mới
 */
export interface ProductNewPayload {
  product_id: number;
  start_date?: string | null; // yyyy-mm-dd
  end_date?: string | null;   // yyyy-mm-dd
  status?: boolean;
}

/**
 * Params danh sách
 */
export interface ProductNewListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: number | boolean;
  valid_only?: boolean;
}

class ProductNewService {
  /**
   * Lấy danh sách sản phẩm mới
   */
  static async list(params?: ProductNewListParams) {
    return api.get("/product-news", { params });
  }

  /**
   * Lấy chi tiết sản phẩm mới
   */
  static async get(id: number) {
    return api.get(`/product-news/${id}`);
  }

  /**
   * Thêm sản phẩm mới
   */
  static async create(data: ProductNewPayload) {
    return api.post("/product-news", data);
  }

  /**
   * Cập nhật sản phẩm mới
   */
  static async update(id: number, data: ProductNewPayload) {
    return api.put(`/product-news/${id}`, data);
  }

  /**
   * Xóa sản phẩm mới
   */
  static async delete(id: number) {
    return api.delete(`/product-news/${id}`);
  }
}

export default ProductNewService;
