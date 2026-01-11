"use client";

import { CloseCircleOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-md w-full">
        <CloseCircleOutlined className="text-red-500 text-6xl mb-4" />

        <h1 className="text-2xl font-bold mb-3">
          Thanh toán thất bại 😥
        </h1>

        <p className="text-gray-600 mb-6">
          Giao dịch không thành công hoặc đã bị hủy.  
          Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/cart"
            className="bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Quay lại giỏ hàng
          </Link>

          <Link
            href="/"
            className="border border-gray-300 py-2 rounded hover:bg-gray-100"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
