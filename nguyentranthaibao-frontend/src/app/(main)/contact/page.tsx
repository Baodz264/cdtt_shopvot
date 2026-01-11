"use client";

import { useState, useEffect } from "react";
import ContactService from "@/services/ContactService";
import UserService, { User } from "@/services/UserService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastProvider";

export default function ContactPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        if (authUser) {
          if (isMounted) {
            setUser(authUser);
            setName(authUser.name ?? "");
            setEmail(authUser.email ?? "");
          }
        } else {
          const res = await UserService.detail(1); // hardcode id = 1 nếu chưa có login
          if (isMounted && res) {
            setUser(res);
            setName(res.name ?? "");
            setEmail(res.email ?? "");
          }
        }
      } catch (err) {
        console.error("Lấy user thất bại:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();
    return () => { isMounted = false; };
  }, [authUser]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Vui lòng nhập tên";
    if (!email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Email không hợp lệ";
    if (!message.trim()) newErrors.message = "Vui lòng nhập nội dung";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await ContactService.create({ fullname: name, email, message, status: 0 });
      toastSuccess("Gửi liên hệ thành công!");
      setMessage("");
      setErrors({});
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Gửi liên hệ thất bại:", err.message);
        toastError("Gửi liên hệ thất bại. Vui lòng thử lại!");
      } else {
        console.error("Gửi liên hệ thất bại:", err);
        toastError("Gửi liên hệ thất bại. Vui lòng thử lại!");
      }
    }
  };

  if (loading || authLoading) return <p className="text-center py-8">Đang tải thông tin người dùng...</p>;

  return (
    <div className="container mx-auto p-4 space-y-12">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Liên hệ với chúng tôi</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="lg:w-1/2 bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Nhập thông tin của bạn</h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.name ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
                }`}
                placeholder="Nhập tên của bạn"
              />
              {errors.name && <p className="text-red-500 mt-1 text-sm">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.email ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
                }`}
                placeholder="Nhập email"
              />
              {errors.email && <p className="text-red-500 mt-1 text-sm">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">Nội dung</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 transition ${
                  errors.message ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
                }`}
                placeholder="Nhập nội dung liên hệ"
              />
              {errors.message && <p className="text-red-500 mt-1 text-sm">{errors.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md hover:shadow-lg"
            >
              Gửi liên hệ
            </button>
          </form>
        </div>

        {/* Google Map */}
        <div className="lg:w-1/2 rounded-xl overflow-hidden shadow-xl h-96">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.123456789!2d105.84117!3d21.0245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0xxxxxx%3A0xabcdef123456!2sHanoi%2C%20Vietnam!5e0!3m2!1sen!2s!4v1690000000000!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
          />
        </div>
      </div>
    </div>
  );
}
