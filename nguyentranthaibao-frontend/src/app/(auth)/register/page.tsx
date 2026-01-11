"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthService, { RegisterData } from "@/services/AuthService";
import { AxiosError } from "axios";
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Card,
  Space,
} from "antd";
import Link from "next/link";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterData) => {
    setLoading(true);
    try {
      const res = await AuthService.register(values);
      message.success(res.message || "Đăng ký thành công!");
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        message.error(err.response.data?.message || "Đăng ký thất bại");
      } else if (err instanceof Error) {
        message.error(err.message);
      } else {
        message.error("Đăng ký thất bại");
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
      <Card
        style={{ width: 400, borderRadius: 10 }}
        variant="borderless"
        styles={{
          body: { padding: 32 },
        }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Đăng ký
        </Title>

        <Form
          name="register"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Họ và tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu ít nhất 6 ký tự" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="password_confirmation"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu không khớp")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ borderRadius: 6 }}
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Space
          orientation="vertical"
          style={{ width: "100%", textAlign: "center", marginTop: 16 }}
        >
          <Text>
            Đã có tài khoản?{" "}
            <Link href="/login">
              <Text type="secondary" underline>
                Đăng nhập ngay
              </Text>
            </Link>
          </Text>
        </Space>
      </Card>
    </div>
  );
}
