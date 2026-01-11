"use client";

import { useState } from "react";
import AuthService from "@/services/AuthService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastProvider";
import { AxiosError } from "axios";
// Thêm icon từ lucide-react
import { Eye, EyeOff, Lock, Save, Loader2 } from "lucide-react";

interface ApiErrorResponse {
  message?: string;
}

export default function ProfilePassword() {
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.current_password || !form.password || !form.password_confirmation) {
      toast.warning("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (form.password !== form.password_confirmation) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await AuthService.changePassword(form);
      toast.success("Đổi mật khẩu thành công");
      setForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      toast.error(err.response?.data?.message || "Mật khẩu hiện tại không đúng");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            Đổi mật khẩu
          </h2>
          <p className="text-sm text-gray-500">Bảo vệ tài khoản bằng mật khẩu mạnh</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}