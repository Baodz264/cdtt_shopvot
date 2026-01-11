"use client";

import { Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
import CartService from "@/services/CartService";
import CartItemService from "@/services/CartItemService";
import { useToast } from "@/context/ToastProvider"; // đường dẫn tới ToastProvider

// --- Interfaces ---
interface User {
  id: number;
  name?: string;
  email?: string;
}

interface VariantValue {
  id: number;
  value: string;
}

interface Variant {
  id: number;
  name: string;
}

interface SelectedVariants {
  [variantId: number]: VariantValue;
}

interface Product {
  id: number;
  name: string;
  slug: string;
}

interface AddToCartButtonProps {
  product: Product;
  variants: Variant[];
  selectedVariants: SelectedVariants;
  quantity: number;
  price: number;
  image: string;
}

// --- Component ---
export default function AddToCartButton({
  product,
  variants,
  selectedVariants,
  quantity,
  price,
  image,
}: AddToCartButtonProps) {
  const { user } = useAuth() as { user: User | null };
  const toast = useToast();

  const addToCart = async () => {
    if (!user || !user.id) {
      toast.warning("Bạn cần đăng nhập để thêm vào giỏ hàng");
      return;
    }

    if (variants.length !== Object.keys(selectedVariants).length) {
      toast.warning("Vui lòng chọn đầy đủ phân loại");
      return;
    }

    const variantValueId = Object.values(selectedVariants)[0]?.id;
    if (variantValueId === undefined) {
      toast.warning("Vui lòng chọn phân loại sản phẩm");
      return;
    }

    const safeQuantity: number = quantity ?? 1;

    try {
      let cart;
      try {
        cart = await CartService.getCart(user.id);
      } catch {
        cart = await CartService.createCart(user.id);
      }

      if (!cart || !cart.id) throw new Error("Không thể khởi tạo giỏ hàng");

      await CartItemService.add({
        cart_id: cart.id,
        product_id: product.id,
        variant_value_id: variantValueId,
        quantity: safeQuantity,
        price,
      });

      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      console.error(error);
      toast.error("Thêm giỏ hàng thất bại");
    }
  };

  return (
    <Button
      type="primary"
      danger
      size="large"
      block
      icon={<ShoppingCartOutlined />}
      onClick={addToCart}
    >
      THÊM VÀO GIỎ HÀNG
    </Button>
  );
}
