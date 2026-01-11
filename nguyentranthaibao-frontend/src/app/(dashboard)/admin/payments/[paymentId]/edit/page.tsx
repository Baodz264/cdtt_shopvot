"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentEditPage() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState("pending");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cập nhật trạng thái thành: ${paymentStatus}`);
    router.push("/admin/payments");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa thanh toán</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <label className="block">
          <span className="font-semibold">Trạng thái thanh toán</span>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
}
