"use client"; // bắt buộc khi dùng hook

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthService, { LoginData } from "@/services/AuthService";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginData>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await AuthService.login(form);
      console.log("Login success:", res);
      router.push("/admin/dashboard"); // redirect sau login
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data?.message || "Đăng nhập thất bại");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Đăng nhập</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: 10, width: "100%" }}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
