"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Row, Col, Typography, Form } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";

import { useToast } from "@/context/ToastProvider";
import { useAuth } from "@/context/AuthContext";

import OrderService from "@/services/OrderService";
import OrderItemService from "@/services/OrderItemService";
import PaymentService from "@/services/PaymentService";
import AddressService, { Address } from "@/services/AddressService";
import VoucherClaimService from "@/services/VoucherClaimService";
import { VoucherUserService } from "@/services/VoucherUserService";
import CartService from "@/services/CartService";
import CartItemService from "@/services/CartItemService";

import { ExtendedCartItem } from "@/types/cart";
import { Voucher } from "@/types/types";

import { AddressSection } from "@/components/client/checkout/AddressSection";
import VoucherList from "@/components/client/checkout/VoucherSection";
import { PaymentMethodSection } from "@/components/client/checkout/PaymentMethodSection";
import { OrderSummary } from "@/components/client/checkout/OrderSummary";
import { AddAddressModal } from "@/components/client/checkout/AddAddressModal";

const { Title } = Typography;

interface VoucherClaimResponse {
  id: number;
  user_id: number;
  voucher_id: number;
  voucher: Voucher;
}

interface UsedVoucher {
  id: number;
  user_id: number;
  voucher_id: number;
  order_id: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();
  const [form] = Form.useForm();

  const [items, setItems] = useState<ExtendedCartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<"cod" | "momo" | "vnpay" | "paypal">("cod");

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const stored = localStorage.getItem("checkout_items");
    if (!stored) {
      toast.error("Không có sản phẩm để thanh toán");
      router.push("/cart");
      return;
    }
    setItems(JSON.parse(stored));
  }, []);

  /* ================= LOAD ADDRESS ================= */
  useEffect(() => {
    if (authLoading || !user?.id) return;

    AddressService.list({ user_id: user.id }).then((res) => {
      setAddresses(res.data);
      const def = res.data.find((a: Address) => a.is_default === 1);
      setSelectedAddressId(def?.id ?? res.data[0]?.id ?? null);
    });
  }, [user, authLoading]);

  /* ================= LOAD VOUCHERS ================= */
  useEffect(() => {
    if (authLoading || !user?.id) return;

    const fetchVouchers = async () => {
      try {
        const claimRes = await VoucherClaimService.list({ user_id: user.id });
        const claimedVouchers: Voucher[] = claimRes.data.map(
          (i: VoucherClaimResponse) => i.voucher
        );

        const usedRes = await VoucherUserService.list({ user_id: user.id });
        const usedVoucherIds: number[] = usedRes.data.map(
          (i: UsedVoucher) => i.voucher_id
        );

        const availableVouchers = claimedVouchers.filter(
          (v) => !usedVoucherIds.includes(v.id)
        );
        setVouchers(availableVouchers);
      } catch (err) {
        console.error("Lấy voucher thất bại:", err);
      }
    };

    fetchVouchers();
  }, [user, authLoading]);

  /* ================= CALCULATE ================= */
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = 30000;
  const finalTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

  const handleSelectVoucher = (voucher: Voucher, discount: number) => {
    if (voucher.min_order && totalPrice < voucher.min_order) {
      toast.error(`Đơn hàng tối thiểu ${voucher.min_order.toLocaleString()}đ`);
      return;
    }
    setAppliedVoucher(voucher);
    setDiscountAmount(discount);
  };

  /* ================= PAYMENT ================= */
  const handlePayment = async () => {
    if (authLoading) return;
    if (!user) return toast.warning("Vui lòng đăng nhập");
    if (!selectedAddressId) return toast.warning("Chọn địa chỉ giao hàng");

    setLoading(true);
    try {
      const addr = addresses.find((a) => a.id === selectedAddressId);

      /* ===== VNPAY ===== */
      if (paymentMethod === "vnpay") {
        if (!items.length) {
          toast.error("Không có sản phẩm để thanh toán VNPAY");
          return;
        }

        const vnpPayload = {
          user_id: user!.id!,
          items,
          voucher: appliedVoucher,
          address_id: selectedAddressId,
          total: finalTotal,
          order_info: `Thanh toán đơn hàng của ${addr?.fullname}`,
        };

        const res = await PaymentService.createVnpayPayment({
          amount: finalTotal,
          order_info: vnpPayload.order_info,
        });

        if (!res.data.payment_url) {
          toast.error("Không thể tạo link thanh toán VNPAY");
          return;
        }

        localStorage.setItem("vnpay_checkout", JSON.stringify(vnpPayload));
        window.location.href = res.data.payment_url;
        return;
      }

      /* ===== COD / MOMO / PAYPAL ===== */
      const order = await OrderService.create({
        user_id: user!.id!,
        address_id: selectedAddressId,
        fullname: addr?.fullname || "",
        phone: addr?.phone || "",
        total_money: finalTotal,
        payment_method: paymentMethod,
        status: "pending",
        payment_status: "unpaid",
      });

      await Promise.all(
        items.map((i) =>
          OrderItemService.create({
            order_id: order.id,
            product_id: i.product_id,
            variant_value_id: i.variant_value_id ?? null,
            quantity: i.quantity,
            price: i.price,
          })
        )
      );

      if (appliedVoucher) {
        await VoucherUserService.create({
          voucher_id: appliedVoucher.id,
          user_id: user!.id!,
          order_id: order.id,
        });
        setVouchers((prev) => prev.filter((v) => v.id !== appliedVoucher.id));
      }

      if (paymentMethod === "momo" || paymentMethod === "paypal") {
        await PaymentService.create({
          order_id: order.id,
          method: paymentMethod,
          amount: finalTotal,
          payment_status: "pending",
        });
      }

      const cart = await CartService.getCart(user!.id!);
      if (cart?.id) await CartItemService.clearCart(cart.id);

      localStorage.removeItem("checkout_items");
      toast.success("Đặt hàng thành công");
      router.push("/");
    } catch (e) {
      console.error(e);
      toast.error("Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ❌ ĐÃ BỎ ĐOẠN if (authLoading) return (...) */

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="container mx-auto max-w-6xl">
        <Title level={2} className="text-center mb-8">
          <ShoppingOutlined /> THANH TOÁN
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <div className="flex flex-col gap-6">
              <AddressSection
                addresses={addresses}
                selectedId={selectedAddressId}
                onChange={setSelectedAddressId}
                onAddNew={() => setShowAddModal(true)}
              />

              <VoucherList
                vouchers={vouchers}
                orderTotal={totalPrice}
                onSelect={handleSelectVoucher}
              />

              <PaymentMethodSection
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <OrderSummary
              items={items}
              totalPrice={totalPrice}
              shippingFee={shippingFee}
              discountAmount={discountAmount}
              finalTotal={finalTotal}
              loading={loading}
              onPayment={handlePayment}
            />
          </Col>
        </Row>
      </div>

      <AddAddressModal
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        form={form}
        onFinish={async (v) => {
          if (!user) return;
          const addr = await AddressService.create({
            ...v,
            user_id: user!.id!,
            is_default: 1,
          } as Address);

          setAddresses((p) => [...p, addr]);
          setSelectedAddressId(addr.id);
          setShowAddModal(false);
          form.resetFields();
        }}
      />
    </div>
  );
}
