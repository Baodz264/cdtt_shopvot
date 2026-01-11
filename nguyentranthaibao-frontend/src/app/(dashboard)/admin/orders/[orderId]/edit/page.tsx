"use client";

import Link from "next/link";

export default function OrderEditPage() {
  // Dữ liệu giả
  const order = {
    id: 101,
    status: "pending",
    payment_method: "COD",
    note: "Giao hàng giờ hành chính",
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa đơn hàng #{order.id}</h1>

      <form className="max-w-md border p-4 rounded-lg bg-gray-50 space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Trạng thái</label>
          <select className="w-full border p-2 rounded" defaultValue={order.status}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipping">Shipping</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Phương thức thanh toán</label>
          <select className="w-full border p-2 rounded" defaultValue={order.payment_method}>
            <option value="cod">COD</option>
            <option value="momo">Momo</option>
            <option value="vnpay">VNPay</option>
            <option value="paypal">Paypal</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Ghi chú</label>
          <textarea
            className="w-full border p-2 rounded"
            defaultValue={order.note}
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Lưu thay đổi
          </button>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
