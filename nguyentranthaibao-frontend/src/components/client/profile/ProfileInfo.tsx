"use client";
import { useState } from "react";
import { User } from "@/services/UserService";
import UserService from "@/services/UserService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastProvider";
import { User as UserIcon, Phone, Mail, Lock, Save, Loader2 } from "lucide-react";

export default function ProfileInfo({ user }: { user: User }) {
  const { user: authUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!authUser?.id) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);

      await UserService.update(authUser.id, formData);
      toast.success("Cập nhật thông tin thành công");
    } catch (err) {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
      </div>

      <div className="space-y-6">
        {/* EMAIL (Read Only) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
            Địa chỉ Email
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
              value={user.email}
              disabled
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <p className="mt-1.5 text-xs text-gray-400 ml-1 italic">* Email không thể thay đổi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HỌ TÊN */}
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Họ và tên
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400"
                placeholder="Nhập họ tên của bạn"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          {/* SỐ ĐIỆN THOẠI */}
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Số điện thoại
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400"
                placeholder="090x xxx xxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`
            flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl
            transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200
            active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>
    </div>
  );
}