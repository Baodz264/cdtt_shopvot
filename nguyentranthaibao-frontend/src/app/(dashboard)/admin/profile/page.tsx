"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Descriptions,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  Flex, // Import Flex để thay thế Space vertical
} from "antd";
import type { UploadProps } from "antd";
import {
  UserOutlined,
  EditOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import AuthService from "@/services/AuthService";
import UserService, { User } from "@/services/UserService";
import { IMAGE_BASE } from "@/services/api";

export default function AdminProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await AuthService.me();
      setUser(res);
    } catch (err) {
      message.error("Không thể tải thông tin tài khoản");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onFinish = async (values: Partial<User>) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", values.name || "");
      if (values.phone) formData.append("phone", values.phone);
      if (avatarFile) formData.append("avatar", avatarFile);

      await UserService.update(user.id, formData);
      message.success("Cập nhật thành công");
      setOpen(false);
      setAvatarFile(null);
      fetchProfile();
    } catch (err) {
      message.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      setAvatarFile(file);
      return false;
    },
    maxCount: 1,
    showUploadList: false,
  };

  return (
    <div style={{ maxWidth: 1000, margin: "24px auto", padding: "0 16px" }}>
      {/* HEADER SECTION */}
      <Card
        variant="borderless"
        styles={{ body: { padding: 0, overflow: 'hidden' } }}
        style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: 24 }}
      >
        <div style={{ 
          height: 160, 
          background: "linear-gradient(90deg, #1890ff 0%, #722ed1 100%)",
          position: 'relative'
        }} />
        
        <div style={{ padding: '0 32px 32px 32px', marginTop: -48 }}>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <Space align="end" size={20}>
              <Avatar
                size={120}
                style={{ 
                  border: '4px solid #fff', 
                  backgroundColor: '#f5f5f5',
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : user?.avatar
                    ? `${IMAGE_BASE}${user.avatar}`
                    : undefined
                }
                icon={<UserOutlined />}
              />
              <div style={{ marginBottom: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{user?.name}</h1>
                <p style={{ color: "#666", margin: 0 }}>{user?.role?.toUpperCase()}</p>
              </div>
            </Space>
            <Button
              type="primary"
              shape="round"
              icon={<EditOutlined />}
              size="large"
              onClick={() => setOpen(true)}
              style={{ marginBottom: 8 }}
            >
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </div>
      </Card>

      <Row gutter={24}>
        {/* CỘT TRÁI */}
        <Col xs={24} md={8}>
          <Card 
            title="Thông tin nhanh" 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            {/* FIX: Sử dụng Flex vertical thay cho Space direction="vertical" */}
            <Flex vertical gap={16}>
              <div className="flex items-center gap-3">
                <MailOutlined style={{ color: '#1890ff' }} />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneOutlined style={{ color: '#52c41a' }} />
                <span>{user?.phone || "Chưa cập nhật"}</span>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <Flex justify="space-between" align="center">
                <span style={{ color: '#888' }}>Trạng thái:</span>
                {user?.status === 1 ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Hoạt động</Tag>
                ) : (
                  <Tag color="error" icon={<StopOutlined />}>Đã khóa</Tag>
                )}
              </Flex>
            </Flex>
          </Card>
        </Col>

        {/* CỘT PHẢI */}
        <Col xs={24} md={16}>
          <Card 
            title="Chi tiết tài khoản" 
            variant="borderless"
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <Descriptions 
              column={1} 
              styles={{ label: { color: '#888', fontWeight: 400 } }}
            >
              <Descriptions.Item label="Họ và tên đầy đủ">
                <span style={{ fontWeight: 600 }}>{user?.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ Email">
                {user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {user?.phone || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Cấp độ quản trị">
                <Tag color="purple">{user?.role}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* MODAL EDIT */}
      <Modal
        title="Cập nhật thông tin cá nhân"
        open={open}
        onCancel={() => {
            setOpen(false);
            setAvatarFile(null);
        }}
        footer={null}
        destroyOnHidden
        centered
      >
        <Form
          layout="vertical"
          initialValues={{
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
          }}
          onFinish={onFinish}
        >
          <Flex vertical align="center" gap={12} style={{ marginBottom: 24 }}>
                <Avatar
                    size={100}
                    src={
                        avatarFile
                        ? URL.createObjectURL(avatarFile)
                        : user?.avatar
                        ? `${IMAGE_BASE}${user.avatar}`
                        : undefined
                    }
                    icon={<UserOutlined />}
                    style={{ border: '1px solid #ddd' }}
                />
                <Upload {...uploadProps}>
                    <Button size="small" icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
                </Upload>
          </Flex>

          <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: 'Không được để trống' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone">
            <Input />
          </Form.Item>

          <Divider />

          <Flex justify="end" gap={8}>
              <Button onClick={() => setOpen(false)}>Hủy bỏ</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
              </Button>
          </Flex>
        </Form>
      </Modal>
    </div>
  );
}