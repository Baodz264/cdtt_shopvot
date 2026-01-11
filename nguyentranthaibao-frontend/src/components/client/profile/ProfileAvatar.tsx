"use client";
import { useState } from "react";
import { User } from "@/services/UserService";
import UserService from "@/services/UserService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastProvider";
import { CameraIcon, Loader2 } from "lucide-react"; // Giả định bạn dùng lucide-react (phổ biến với Next.js)

const IMAGE_BASE = "http://localhost:8000";

export default function ProfileAvatar({ user }: { user: User }) {
  const { user: authUser } = useAuth();
  const toast = useToast();

  const [preview, setPreview] = useState<string>(
    user.avatar
      ? IMAGE_BASE + user.avatar
      : "/images/avatars/default-avatar.png"
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleChangeAvatar = async (file: File) => {
    if (!authUser?.id) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      await UserService.update(authUser.id, formData);
      setPreview(URL.createObjectURL(file));
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      toast.error("Upload ảnh thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm mx-auto">
      {/* Container của Avatar */}
      <div className="relative group">
        <div className={`
          relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-50 transition-all duration-300
          ${isUploading ? "opacity-50" : "group-hover:ring-blue-100"}
        `}>
          <img
            src={preview}
            alt={user.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay khi hover hoặc đang upload */}
          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <>
                <CameraIcon className="w-8 h-8 text-white mb-1" />
                <span className="text-[10px] text-white font-medium uppercase tracking-wider">Thay đổi</span>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChangeAvatar(file);
              }}
            />
          </label>
        </div>

        {/* Nút nhỏ góc dưới (tùy chọn) */}
        {!isUploading && (
          <div className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg pointer-events-none">
            <CameraIcon className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Thông tin User */}
      <div className="mt-5 text-center">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">{user.name}</h2>
        <p className="text-sm text-gray-500 font-medium">{user.email}</p>
      </div>

      {/* Status Badge (Ví dụ: Member) */}
      <div className="mt-3 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">
        Thành viên chính thức
      </div>
    </div>
  );
}