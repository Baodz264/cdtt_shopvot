// services/ProductImageService.ts
import api from "./api";

export interface ProductImagePayload {
  product_id?: number;
  image?: File | null;
  is_default?: number;
}

class ProductImageService {
  // Lấy danh sách ảnh theo product_id
  static async list(params?: {
    product_id?: number;
    page?: number;
    limit?: number;
  }) {
    return api.get("/product-images", { params });
  }

  // Chi tiết ảnh
  static async get(id: number) {
    return api.get(`/product-images/${id}`);
  }

  // Thêm ảnh sản phẩm
  static async create(data: ProductImagePayload) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return api.post("/product-images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // Cập nhật ảnh
  static async update(id: number, data: ProductImagePayload) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return api.post(`/product-images/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // Xóa ảnh
  static async delete(id: number) {
    return api.delete(`/product-images/${id}`);
  }
}

export default ProductImageService;
