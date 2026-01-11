// services/OrderService.ts
import api from "./api";

export type PaymentMethod = "cod" | "momo" | "vnpay" | "paypal";
export type OrderStatus = "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface Order {
  id: number;
  user_id?: number | null;
  address_id?: number | null;
  fullname: string;
  phone: string;
  note?: string | null;
  total_money: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  payment_status: PaymentStatus;
  voucher_id?: number | null;
  discount_price?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderDetailResponse {
  id: number;
  fullname: string;
  phone: string;
  total_money: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  items: OrderItem[];
}

export interface OrderListResponse {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Order[];
}

export interface ApiMessageResponse {
  message: string;
}

export interface CreateOrderRequest {
  user_id?: number | null;
  address_id?: number | null;
  fullname: string;
  phone: string;
  note?: string;
  total_money: number;
  payment_method: PaymentMethod;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  voucher_id?: number | null;
  discount_price?: number | null;
}

export interface UpdateOrderRequest {
  fullname?: string;
  phone?: string;
  note?: string;
  total_money?: number;
  payment_method?: PaymentMethod;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  discount_price?: number | null;
}

const OrderService = {
  // Lấy danh sách đơn hàng
  async list(params?: {
    page?: number;
    limit?: number;
    user_id?: number;
    status?: OrderStatus;
  }): Promise<OrderListResponse> {
    const response = await api.get<OrderListResponse>("/orders", { params });
    return response.data;
  },

  // Chi tiết đơn hàng kèm items
  async detail(id: number): Promise<OrderDetailResponse> {
    const response = await api.get<OrderDetailResponse>(`/orders/${id}`);
    return response.data;
  },

  // Tạo đơn hàng
  async create(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post<Order>("/orders", data);
    return response.data;
  },

  // Cập nhật đơn hàng
  async update(id: number, data: UpdateOrderRequest): Promise<Order> {
    const response = await api.put<Order>(`/orders/${id}`, data);
    return response.data;
  },

  // Xóa đơn hàng
  async delete(id: number): Promise<ApiMessageResponse> {
    const response = await api.delete<ApiMessageResponse>(`/orders/${id}`);
    return response.data;
  },
};

export default OrderService;
