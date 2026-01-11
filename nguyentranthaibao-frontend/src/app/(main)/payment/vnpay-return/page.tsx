import { Suspense } from "react";
import VnpayReturnClient from "./VnpayReturnClient";

export default function VnpayReturnPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Đang xử lý thanh toán...</div>}>
      <VnpayReturnClient />
    </Suspense>
  );
}
