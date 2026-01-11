import api from "./api";

export type VoucherUserFilter = {
  user_id?: number;
  voucher_id?: number;
  order_id?: number;
  page?: number;
  limit?: number;
};

export type CreateVoucherUserPayload = {
  voucher_id: number;
  user_id: number;
  order_id: number;
};

export const VoucherUserService = {
  // Lấy danh sách voucher đã sử dụng (có phân trang)
  async list(params?: VoucherUserFilter) {
    const response = await api.get("/voucher-users", { params });
    return response.data;
  },

  // Lưu voucher đã dùng (khi user thanh toán)
  async create(data: CreateVoucherUserPayload) {
    const response = await api.post("/voucher-users", data);
    return response.data;
  },

  // Xóa voucher đã dùng (quản trị hoặc rollback)
  async delete(id: number) {
    const response = await api.delete(`/voucher-users/${id}`);
    return response.data;
  },
};

export default VoucherUserService;
