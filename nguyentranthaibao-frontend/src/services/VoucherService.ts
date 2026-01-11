import api from "./api";

export type UpdateVoucherPayload = {
  code?: string;
  name?: string;
  type?: "percent" | "fixed";
  discount_value?: number;
  max_discount?: number | null;
  min_order?: number | null;
  quantity?: number;
  used?: number;
  start_date?: string | null;
  end_date?: string | null;
  status?: number;
};

export const VoucherService = {
  async list(params?: {
    search?: string;
    status?: number;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get("/vouchers", { params });
    return response.data;
  },

  async detail(id: number) {
    const response = await api.get(`/vouchers/${id}`);
    return response.data;
  },

  async create(data: {
    code: string;
    name: string;
    type: "percent" | "fixed";
    discount_value: number;
    max_discount?: number | null;
    min_order?: number | null;
    quantity?: number;
    used?: number;
    start_date?: string | null;
    end_date?: string | null;
    status?: number;
  }) {
    const response = await api.post("vouchers", data);
    return response.data;
  },

  async update(id: number, data: UpdateVoucherPayload) {
    const response = await api.put(`/vouchers/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/vouchers/${id}`);
    return response.data;
  },
};
