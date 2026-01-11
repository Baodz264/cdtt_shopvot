import api from "./api";

export const VoucherClaimService = {
  // Lấy danh sách claim voucher (có phân trang)
  async list(params?: {
    user_id?: number;
    voucher_id?: number;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get("/voucher-claims", { params });
    return response.data;
  },

  // Tạo claim voucher (user claim voucher)
  async create(data: {
    voucher_id: number;
    user_id: number;
  }) {
    const response = await api.post("/voucher-claims", data);
    return response.data;
  },

  // Xóa claim voucher
  async delete(id: number) {
    const response = await api.delete(`/voucher-claims/${id}`);
    return response.data;
  },
};

export default VoucherClaimService;
