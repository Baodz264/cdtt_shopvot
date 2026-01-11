// services/CartService.ts
import api from "./api";

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  created_at?: string;
  updated_at?: string;
}

const CartService = {
  // Lấy giỏ hàng của user
  async getCart(user_id: number): Promise<Cart> {
    const response = await api.get("/carts", { params: { user_id } });
    return response.data;
  },

  // Tạo giỏ hàng mới cho user
  async createCart(user_id: number): Promise<Cart> {
    const response = await api.post("/carts", { user_id });
    return response.data;
  },

  // Xóa giỏ hàng
  async deleteCart(cart_id: number): Promise<{ message: string }> {
    const response = await api.delete(`/carts/${cart_id}`);
    return response.data;
  },
};

export default CartService;
