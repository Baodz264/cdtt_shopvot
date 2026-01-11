import api from "./api"; // file api.ts bạn đã tạo


export interface ProductVariantValuePayload {
  variant_id?: number;
  value?: string;
  extra_price?: number | null;
  stock?: number | null;
  thumbnail?: File | null;
}

const ProductVariantValueService = {
  /**
   * Lấy danh sách giá trị biến thể (có phân trang, search)
   */
  async list(params?: {
    page?: number;
    limit?: number;
    variant_id?: number;
    search?: string;
  }) {
    return api.get("/product-variant-values", { params });
  },

  /**
   * Chi tiết một giá trị biến thể
   */
  async detail(id: number) {
    return api.get(`/product-variant-values/${id}`);
  },

  /**
   * Thêm giá trị biến thể (có upload ảnh)
   */
  async create(data: ProductVariantValuePayload) {
    const formData = new FormData();

    if (data.variant_id) formData.append("variant_id", data.variant_id.toString());
    if (data.value) formData.append("value", data.value);
    if (data.extra_price !== undefined)
      formData.append("extra_price", String(data.extra_price));
    if (data.stock !== undefined)
      formData.append("stock", String(data.stock));
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

    return api.post("/product-variant-values", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Cập nhật giá trị biến thể (có upload ảnh)
   */
  async update(id: number, data: ProductVariantValuePayload) {
    const formData = new FormData();

    if (data.variant_id) formData.append("variant_id", data.variant_id.toString());
    if (data.value) formData.append("value", data.value);
    if (data.extra_price !== undefined)
      formData.append("extra_price", String(data.extra_price));
    if (data.stock !== undefined)
      formData.append("stock", String(data.stock));
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

    return api.post(`/product-variant-values/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Xóa giá trị biến thể
   */
  async delete(id: number) {
    return api.delete(`/product-variant-values/${id}`);
  },
};

export default ProductVariantValueService;
