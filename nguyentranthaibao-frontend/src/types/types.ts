import { Address } from "@/services/AddressService";
import { PaymentMethod } from "@/services/OrderService";

export interface Voucher {
  id: number;
  code: string;
  type: "percent" | "fixed";
  discount_value: number;
  min_order?: number;
  max_discount?: number;
  quantity: number | null;
  used: number;
  status: number;
  end_date?: string;
}

export const PAYMENT_METHODS = [
  { value: "cod" as PaymentMethod, label: "Thanh toán khi nhận hàng (COD)", image: "/images/payment/cod.png" },
  { value: "momo" as PaymentMethod, label: "Ví MoMo", image: "/images/payment/MoMo.png" },
  { value: "vnpay" as PaymentMethod, label: "VNPay", image: "/images/payment/vnpay.jpg" },
  { value: "paypal" as PaymentMethod, label: "PayPal", image: "/images/payment/paypal.png" },
];