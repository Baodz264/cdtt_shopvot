"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import AuthService, { LoginData } from "@/services/AuthService";
import { Form, Input, Button, Typography, Card } from "antd";
import { useToast } from "@/context/ToastProvider";

const { Title } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const toast = useToast(); // ✅ hook của bạn

  const onFinish = async (values: LoginData) => {
    setLoading(true);
    try {
      await AuthService.login(values);

      toast.success("Đăng nhập thành công!"); // sử dụng Toastify
      router.push("/admin");
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        toast.error(err.response.data?.message || "Đăng nhập thất bại");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
        padding: 16,
      }}
    >
      <Card style={{ width: 400, borderRadius: 10, padding: 32 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Đăng nhập Admin
        </Title>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="admin@email.com" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ borderRadius: 6 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
