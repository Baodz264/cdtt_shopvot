"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spin, Result, Button, message, Typography } from "antd";
import AuthService from "@/services/AuthService";

const { Text } = Typography;

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      return;
    }

    (async () => {
      try {
        const res = await AuthService.verifyEmail(token);
        message.success(res?.message || "Xác thực email thành công!");
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 2000);
      } catch {
        message.error("Xác thực email thất bại!");
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16 }}>Đang xác thực email...</Text>
      </div>
    );
  }

  if (!token || success === false) {
    return (
      <Result
        status="error"
        title="❌ Xác thực email thất bại!"
        subTitle="Liên kết không hợp lệ hoặc đã hết hạn."
        extra={<Button type="primary" onClick={() => router.push("/auth/login")}>Quay về đăng nhập</Button>}
      />
    );
  }

  return (
    <Result
      status="success"
      title="🎉 Xác thực email thành công!"
      subTitle="Bạn sẽ được chuyển hướng đến đăng nhập."
      extra={<Button type="primary" onClick={() => router.push("/auth/login")}>Đi đến đăng nhập</Button>}
    />
  );
}
