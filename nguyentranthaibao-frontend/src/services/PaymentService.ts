import api from "./api";

/* ===================== TYPES ===================== */

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  payment_status?: string;
  created_at?: string;
  updated_at?: string;
}

export type PaymentMethod = "cod" | "momo" | "vnpay" | "paypal";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Payment {
  id: number;
  order_id: number;
  method: PaymentMethod;
  amount: number;
  transaction_id?: string | null;
  payment_status?: PaymentStatus;
  message?: string | null;
  created_at?: string;
  updated_at?: string;

  order?: Order;
}

export interface PaymentListResponse {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Payment[];
}

/* ===================== SERVICE ===================== */

const PaymentService = {
  /** Lấy danh sách payment */
  list: (params?: { page?: number; limit?: number; order_id?: number }) =>
    api.get<PaymentListResponse>("/payments", { params }),

  /** Tạo payment thủ công (COD, momo, paypal, vnpay) */
  create: (data: {
    order_id: number;
    method: PaymentMethod;
    amount: number;
    transaction_id?: string;
    payment_status?: PaymentStatus;
    message?: string;
  }) => api.post<Payment>("/payments", data),

  /** Lấy chi tiết payment */
  detail: (id: number) => api.get<Payment>(`/payments/${id}`),

  /** Cập nhật payment */
  update: (
    id: number,
    data: Partial<{
      order_id: number;
      method: PaymentMethod;
      amount: number;
      transaction_id: string;
      payment_status: PaymentStatus;
      message: string;
    }>
  ) => api.put<Payment>(`/payments/${id}`, data),

  /** Xóa payment */
  delete: (id: number) => api.delete(`/payments/${id}`),

  /* ---------- VNPAY ---------- */

  /** Tạo URL thanh toán VNPAY */
  createVnpayPayment: (data: {
    amount: number;
    order_info?: string;
  }) => api.post<{ payment_url: string }>("/payments/vnpay", data),

  /** Xử lý callback VNPAY */
  vnpayReturn: (params: Record<string, string>) =>
    api.get("/payments/vnpay-return", { params }),
};

export default PaymentService;
