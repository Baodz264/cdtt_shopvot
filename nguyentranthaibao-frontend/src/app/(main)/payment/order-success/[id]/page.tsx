"use client";

import { CheckCircleOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-md w-full">
        <CheckCircleOutlined className="text-green-500 text-6xl mb-4" />

        <h1 className="text-2xl font-bold mb-3">
          Thanh toán thành công 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được thanh toán thành công.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/orders"
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Xem đơn hàng
          </Link>

          <Link
            href="/"
            className="border border-gray-300 py-2 rounded hover:bg-gray-100"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
