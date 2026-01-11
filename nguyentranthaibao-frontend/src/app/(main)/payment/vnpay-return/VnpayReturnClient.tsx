"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/context/ToastProvider";
import { useAuth } from "@/context/AuthContext";

import OrderService from "@/services/OrderService";
import OrderItemService from "@/services/OrderItemService";
import VoucherUserService from "@/services/VoucherUserService";
import CartService from "@/services/CartService";
import CartItemService from "@/services/CartItemService";
import PaymentService from "@/services/PaymentService";
import AddressService, { Address } from "@/services/AddressService";

/* ================= TYPES ================= */
interface VnpayCheckoutItem {
  product_id: number;
  variant_value_id?: number | null;
  quantity: number;
  price: number;
}

interface VnpayCheckoutPayload {
  user_id: number;
  address_id: number;
  items: VnpayCheckoutItem[];
  voucher?: { id: number } | null;
  total: number;
}

/* ================= COMPONENT ================= */
export default function VnpayReturnClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleVnpayReturn = async () => {
      if (authLoading) return;

      if (!user) {
        toast.warning("Vui lòng đăng nhập");
        router.push("/auth/login");
        return;
      }

      try {
        const code = searchParams.get("vnp_ResponseCode");
        if (code !== "00") {
          toast.error("Thanh toán VNPAY thất bại");
          router.push("/cart");
          return;
        }

        const payloadStr = localStorage.getItem("vnpay_checkout");
        if (!payloadStr) throw new Error("Không tìm thấy payload VNPAY");

        const payload: VnpayCheckoutPayload = JSON.parse(payloadStr);

        /* ===== LOAD ADDRESS ===== */
        const addressRes = await AddressService.list({ user_id: user!.id! });
        const address = addressRes.data.find((a: Address) => a.id === payload.address_id);

        if (!address) throw new Error("Không tìm thấy địa chỉ giao hàng");

        /* ===== CREATE ORDER ===== */
        const order = await OrderService.create({
          user_id: user!.id!,
          address_id: payload.address_id,
          fullname: address.fullname,
          phone: address.phone,
          total_money: payload.total,
          payment_method: "vnpay",
          status: "pending",
          payment_status: "paid",
        });

        /* ===== CREATE ORDER ITEMS ===== */
        await Promise.all(
          payload.items.map((i) =>
            OrderItemService.create({
              order_id: order.id,
              product_id: i.product_id,
              variant_value_id: i.variant_value_id ?? null,
              quantity: i.quantity,
              price: i.price,
            })
          )
        );

        /* ===== APPLY VOUCHER ===== */
        if (payload.voucher) {
          await VoucherUserService.create({
            voucher_id: payload.voucher.id,
            user_id: user!.id!,
            order_id: order.id,
          });
        }

        /* ===== PAYMENT RECORD ===== */
        await PaymentService.create({
          order_id: order.id,
          method: "vnpay",
          amount: payload.total,
          payment_status: "paid",
        });

        /* ===== CLEAR CART ===== */
        const cart = await CartService.getCart(user!.id!);
        if (cart?.id) await CartItemService.clearCart(cart.id);

        localStorage.removeItem("vnpay_checkout");
        localStorage.removeItem("checkout_items");

        toast.success("Thanh toán VNPAY thành công");
        router.push("/");
      } catch (err) {
        console.error("VNPAY ERROR:", err);
        toast.error("Xử lý đơn hàng VNPAY thất bại");
        router.push("/cart");
      } finally {
        setLoading(false);
      }
    };

    handleVnpayReturn();
  }, [searchParams, user, authLoading]);

  return (
    <div className="flex justify-center items-center h-screen">
      {loading ? "Đang xử lý đơn hàng..." : "Hoàn tất"}
    </div>
  );
}
