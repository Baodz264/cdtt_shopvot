"use client"; // bắt buộc khi dùng hook

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthService, { RegisterData } from "@/services/AuthService";
import { AxiosError } from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await AuthService.register(form);
      setSuccess(res.message);
      console.log("Token test:", res.token_for_test);
      setForm({ name: "", email: "", password: "", password_confirmation: "" });
      // router.push("/login"); // có thể redirect
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data?.message || "Đăng ký thất bại");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đăng ký thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Đăng ký</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Họ tên</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Mật khẩu</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div>
          <label>Xác nhận mật khẩu</label>
          <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}
