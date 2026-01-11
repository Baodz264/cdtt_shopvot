// services/ProductVariantService.ts
import api from "./api";

export interface VariantPayload {
  product_id?: number;
  name?: string;
  image?: File | null;
}

class ProductVariantService {
  // Lấy danh sách biến thể
  static async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    product_id?: number;
  }) {
    return api.get("/product-variants", { params });
  }

  // Chi tiết biến thể
  static async get(id: number) {
    return api.get(`/product-variants/${id}`);
  }

  // Thêm biến thể (có upload file)
  static async create(data: VariantPayload) {
    const formData = new FormData();
    if (data.product_id) formData.append("product_id", String(data.product_id));
    if (data.name) formData.append("name", data.name);
    if (data.image) formData.append("image", data.image);

    return api.post("/product-variants", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // Cập nhật biến thể
  static async update(id: number, data: VariantPayload) {
    const formData = new FormData();
    if (data.product_id) formData.append("product_id", String(data.product_id));
    if (data.name) formData.append("name", data.name);
    if (data.image) formData.append("image", data.image);

    return api.post(`/product-variants/${id}`, formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Xóa biến thể
  static async delete(id: number) {
    return api.delete(`/product-variants/${id}`);
  }
}

export default ProductVariantService;
