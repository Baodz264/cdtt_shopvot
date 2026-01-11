"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { VoucherService } from "@/services/VoucherService";
import VoucherClaimService from "@/services/VoucherClaimService";
import { useToast } from "@/context/ToastProvider";
import { Ticket, Info, CheckCircle2, Lock } from "lucide-react"; // Cần cài lucide-react

interface Voucher {
  id: number;
  name: string;
  code: string;
  type: "percent" | "fixed";
  discount_value: number;
  min_order?: number | null;
  max_discount?: number | null;
  status: number;
}

export default function PromotionPage() {
  const { user, loading: authLoading } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await VoucherService.list({ status: 1, page: 1, limit: 20 });
        setVouchers(res.data as Voucher[]);
      } catch {
        toastError("Không thể tải danh sách khuyến mãi!");
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, [toastError]);

  const handleClaim = async (voucherId: number) => {
    if (!user) return toastError("Bạn cần đăng nhập để nhận voucher!");
    try {
      await VoucherClaimService.create({ voucher_id: voucherId, user_id: user.id! });
      toastSuccess("Lưu mã ưu đãi thành công!");
    } catch {
      toastError("Voucher đã có trong kho hoặc đã hết lượt!");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-blue-600 font-medium">Đang tải ưu đãi hấp dẫn...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Banner Header */}
      <div className="bg-white border-b border-gray-100 mb-10">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Ticket size={16} />
            Rewards Center
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Săn Voucher <span className="text-blue-600">Độc Quyền</span>
          </h1>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-lg">
            Tiết kiệm hơn cho mỗi đơn hàng. Thu thập ngay các mã giảm giá từ các thương hiệu yêu thích của bạn.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="group relative bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1 flex flex-col overflow-hidden"
            >
              {/* Top Section: Voucher Info */}
              <div className="p-6 flex gap-5">
                {/* Badge Discount */}
                <div className={`shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg ${
                  v.type === 'percent' ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}>
                  <span className="text-2xl font-black">
                    {v.type === "percent" ? `${v.discount_value}%` : `${(v.discount_value / 1000)}k`}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">OFF</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-lg leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {v.name}
                    </h3>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-tight">
                      Mã: {v.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Divider Line */}
              <div className="relative flex items-center px-6">
                <div className="absolute left-0 -translate-x-1/2 w-4 h-8 bg-[#f8fafc] border-r border-slate-200 rounded-r-full"></div>
                <div className="w-full border-t border-dashed border-slate-200"></div>
                <div className="absolute right-0 translate-x-1/2 w-4 h-8 bg-[#f8fafc] border-l border-slate-200 rounded-l-full"></div>
              </div>

              {/* Bottom Section: Details & Button */}
              <div className="p-6 pt-4 flex flex-col flex-1">
                <div className="space-y-2.5 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span>Đơn tối thiểu: <strong>{v.min_order?.toLocaleString()}đ</strong></span>
                  </div>
                  {v.max_discount && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Info size={14} className="text-blue-400" />
                      <span>Giảm tối đa: <strong>{v.max_discount?.toLocaleString()}đ</strong></span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleClaim(v.id)}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    user 
                    ? "bg-slate-900 text-white hover:bg-blue-600 shadow-md hover:shadow-blue-200" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {!user && <Lock size={16} />}
                  {user ? "Nhận Voucher Ngay" : "Đăng nhập để nhận"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}