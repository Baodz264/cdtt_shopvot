"use client";

import Link from "next/link";
import { useState } from "react";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useToast } from "@/context/ToastProvider";
import { useRouter } from "next/navigation";
import AuthService from "@/services/AuthService";

// Định nghĩa interface cho cấu trúc lỗi từ API
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await AuthService.login({ email, password });
      toast.success("Đăng nhập thành công!");
      router.push("/");
    } catch (error: unknown) {
      // Ép kiểu an toàn từ unknown sang ApiError
      const apiError = error as ApiError;
      const messageText = apiError.response?.data?.message ?? "Email hoặc mật khẩu không đúng!";
      
      toast.error(messageText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl shadow-blue-100/50 rounded-2xl p-10 w-full max-w-md border border-gray-100">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            Chào mừng!
          </h2>
          <p className="text-slate-500 font-medium">
            Đăng nhập để trải nghiệm cùng <span className="text-blue-600 font-bold">ShopVot</span>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="email"
                placeholder="vidu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
              <Link
                href="/auth/forgotpassword"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-600 font-medium">
            Chưa có tài khoản?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 font-bold hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}