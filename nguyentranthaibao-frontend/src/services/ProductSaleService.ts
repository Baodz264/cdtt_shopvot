// services/ProductSaleService.ts
import api from "./api";

/**
 * Payload thêm / cập nhật sản phẩm sale
 */
export interface ProductSalePayload {
  product_id?: number;
  original_price?: number;
  sale_price?: number;
  start_date?: string | null; // yyyy-mm-dd
  end_date?: string | null;   // yyyy-mm-dd
  status?: boolean;
}

/**
 * Params danh sách sản phẩm sale
 */
export interface ProductSaleListParams {
  page?: number;
  limit?: number;

  /* search */
  search?: string;

  /* status */
  status?: number | boolean;
  active_only?: boolean;

  /* filter price */
  min_original_price?: number;
  max_original_price?: number;
  min_sale_price?: number;
  max_sale_price?: number;

  /* filter percent */
  min_percent?: number;
  max_percent?: number;

  /* filter date */
  from_date?: string; // yyyy-mm-dd
  to_date?: string;   // yyyy-mm-dd

  /* sort */
  sort_by?: "id" | "sale_price" | "sale_percent" | "created_at";
  sort_order?: "asc" | "desc";
}

class ProductSaleService {
  /**
   * Lấy danh sách sản phẩm sale
   */
  static async list(params?: ProductSaleListParams) {
    return api.get("/product-sales", { params });
  }

  /**
   * Lấy chi tiết sản phẩm sale
   */
  static async get(id: number) {
    return api.get(`/product-sales/${id}`);
  }

  /**
   * Thêm sản phẩm sale
   */
  static async create(data: ProductSalePayload) {
    return api.post("/product-sales", data);
  }

  /**
   * Cập nhật sản phẩm sale
   */
  static async update(id: number, data: ProductSalePayload) {
    return api.put(`/product-sales/${id}`, data);
  }

  /**
   * Xóa sản phẩm sale
   */
  static async delete(id: number) {
    return api.delete(`/product-sales/${id}`);
  }
}

export default ProductSaleService;
