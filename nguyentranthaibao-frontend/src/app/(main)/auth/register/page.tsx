"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";

import { useToast } from "@/context/ToastProvider";
import AuthService from "@/services/AuthService";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name,
        email,
        password,
        password_confirmation: confirm,
      };

      const res = await AuthService.register(payload);

      toast.success(
        res?.message ||
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirm("");

      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (error: unknown) {
      console.error(error);

      let errorMessage = "Đăng ký thất bại, vui lòng thử lại!";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const err = error as {
          response?: {
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        };

        if (err.response?.data?.errors) {
          const firstError = Object.values(err.response.data.errors)[0];
          if (firstError && firstError.length > 0) {
            errorMessage = firstError[0];
          }
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-700">
          Đăng ký
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Tạo tài khoản để mua sắm dễ dàng hơn!
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Họ và tên</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <FaUser className="text-gray-400 mr-2" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Mật khẩu</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Nhập lại mật khẩu</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-transparent outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold shadow text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
