// services/OrderItemService.ts
import api from "./api";

export interface Product {
  id: number;
  name: string;
  slug: string;
  image?: string;
  price: number;
}

export interface VariantValue {
  id: number;
  variant_id: number;
  value: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_value_id?: number | null;
  quantity: number;
  price: number;
  product?: Product;
  variantValue?: VariantValue;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItemListResponse {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: OrderItem[];
}

export interface CreateOrderItemRequest {
  order_id: number;
  product_id: number;
  variant_value_id?: number | null;
  quantity: number;
  price: number;
}

export interface UpdateOrderItemRequest {
  quantity?: number;
  price?: number;
}

export interface ApiMessageResponse {
  message: string;
}

const OrderItemService = {
  // Lấy danh sách item đơn hàng
  async list(params?: {
    page?: number;
    limit?: number;
    order_id?: number;
  }): Promise<OrderItemListResponse> {
    const response = await api.get<OrderItemListResponse>("/order-items", {
      params,
    });
    return response.data;
  },

  // Thêm item vào đơn hàng
  async create(data: CreateOrderItemRequest): Promise<OrderItem> {
    const response = await api.post<OrderItem>("/order-items", data);
    return response.data;
  },

  // Cập nhật item
  async update(id: number, data: UpdateOrderItemRequest): Promise<OrderItem> {
    const response = await api.put<OrderItem>(`/order-items/${id}`, data);
    return response.data;
  },

  // Xóa item khỏi đơn hàng
  async delete(id: number): Promise<ApiMessageResponse> {
    const response = await api.delete<ApiMessageResponse>(`/order-items/${id}`);
    return response.data;
  },
};

export default OrderItemService;
