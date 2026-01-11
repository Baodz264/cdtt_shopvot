import api from "./api";

/* ================= TYPES ================= */

export interface ProductPayload {
  brand_id?: number | null;
  category_id?: number | null;
  name?: string;
  slug?: string;
  price?: number;
  sale_price?: number | null;
  sku?: string;
  stock?: number;
  description?: string;
  detail?: string;
  status?: number;
  thumbnail?: File | null;
}

/**
 * Params cho list sản phẩm (đúng theo API Laravel)
 */
export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: number;
  category_id?: number;
  brand_id?: number;
  slug?: string;              // 🔥 THÊM SLUG
  price_from?: number;
  price_to?: number;
  sortBy?: "id" | "name" | "price" | "sale_price" | "stock" | "created_at";
  sortOrder?: "asc" | "desc";
}

class ProductService {
  /* ================= DANH SÁCH ================= */
  static async list(params?: ProductListParams) {
    return api.get("/products", { params });
  }

  /* ================= CHI TIẾT THEO ID ================= */
  static async get(id: number) {
    return api.get(`/products/${id}`);
  }

  /* ================= CHI TIẾT THEO SLUG (SEO) ================= */
  static async getBySlug(slug: string) {
    return api.get(`/products/slug/${slug}`);
  }

  /* ================= TẠO MỚI ================= */
  static async create(data: ProductPayload) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "thumbnail" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  /* ================= CẬP NHẬT ================= */
  static async update(id: number, data: ProductPayload) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "thumbnail" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Laravel dùng _method=PUT
    return api.post(`/products/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  /* ================= XÓA ================= */
  static async delete(id: number) {
    return api.delete(`/products/${id}`);
  }
}

export default ProductService;
