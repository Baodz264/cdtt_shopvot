// services/CartItemService.ts
import api from "./api";

// Interface chi tiết cho Product
export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  // thêm các field khác theo API nếu cần
}

// Interface chi tiết cho VariantValue
export interface VariantValue {
  id: number;
  name: string;
  // thêm các field khác theo API nếu cần
}

// Interface cho CartItem
export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variant_value_id?: number | null;
  quantity: number;
  price: number;
  product?: Product;
  variantValue?: VariantValue;
  created_at?: string;
  updated_at?: string;
}

const CartItemService = {
  // Lấy danh sách item trong giỏ hàng
  async list(cart_id: number): Promise<CartItem[]> {
    const response = await api.get("/cart-items", { params: { cart_id } });
    return response.data;
  },

  // Thêm sản phẩm vào giỏ hàng
  async add(data: {
    cart_id: number;
    product_id: number;
    variant_value_id?: number;
    quantity: number;
    price: number;
  }): Promise<CartItem> {
    const response = await api.post("/cart-items", data);
    return response.data;
  },

  // Cập nhật số lượng hoặc giá của item
  async update(id: number, data: { quantity: number; price: number }): Promise<CartItem> {
    const response = await api.put(`/cart-items/${id}`, data);
    return response.data;
  },

  // Xóa sản phẩm khỏi giỏ hàng
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/cart-items/${id}`);
    return response.data;
  },

  // ✅ Xóa toàn bộ item trong cart theo cart_id
  async clearCart(cart_id: number): Promise<{ message: string }> {
    const response = await api.delete(`/cart-items/clear/${cart_id}`);
    return response.data;
  },
};

export default CartItemService;
