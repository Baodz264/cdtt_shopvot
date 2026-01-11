// types/cart.ts

export interface Cart {
  id: number;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail?: string;
}

export interface VariantValue {
  id: number;
  value: string;
  thumbnail?: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variant_value_id?: number;
  quantity: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExtendedCartItem extends CartItem {
  product: Product;
  variant_value?: VariantValue;
}
