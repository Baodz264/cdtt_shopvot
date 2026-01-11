// services/ImportItemService.ts
import api from "./api";

export interface ImportRelation {
  id: number;
  user_id?: number | null;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductRelation {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ImportItem {
  id: number;
  import_id: number;
  product_id: number;
  quantity: number;
  price: number;
  import?: ImportRelation;
  product?: ProductRelation;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedImportItem {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: ImportItem[];
}

const ImportItemService = {
  // Lấy danh sách import item (có phân trang)
  async list(params?: {
    page?: number;
    limit?: number;
    import_id?: number;
  }): Promise<PaginatedImportItem> {
    const response = await api.get("/import-items", { params });
    return response.data;
  },

  // Lấy chi tiết 1 import item
  async get(id: number): Promise<ImportItem> {
    const response = await api.get(`/import-items/${id}`);
    return response.data;
  },

  // Tạo mới import item
  async create(data: {
    import_id: number;
    product_id: number;
    quantity: number;
    price: number;
  }): Promise<ImportItem> {
    const response = await api.post("/import-items", data);
    return response.data;
  },

  // Cập nhật import item
  async update(
    id: number,
    data: {
      import_id?: number;
      product_id?: number;
      quantity?: number;
      price?: number;
    }
  ): Promise<ImportItem> {
    const response = await api.put(`/import-items/${id}`, data);
    return response.data;
  },

  // Xóa import item
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/import-items/${id}`);
    return response.data;
  },
};

export default ImportItemService;
