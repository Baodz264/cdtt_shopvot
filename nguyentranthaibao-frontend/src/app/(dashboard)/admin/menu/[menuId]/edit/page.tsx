"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Form, Input, Select, Button, Switch, message, Spin, InputNumber } from "antd";
import MenuService, { Menu } from "@/services/MenuService";

const { Option } = Select;

// Định nghĩa interface cho cấu trúc dữ liệu form
interface FormValues {
  name: string;
  link?: string;
  type: "category" | "topic" | "post" | "custom";
  position: string;
  parent_id?: number | null;
  statusSwitch: boolean;
}

// Định nghĩa interface cho Response từ Service để tránh dùng 'any'
interface ServiceResponse {
  status: boolean;
  data?: Menu;
  message?: string;
}

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const menuId = params?.menuId as string;

  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const fetchMenu = async () => {
      if (!menuId) return;

      try {
        setLoading(true);
        const res: ServiceResponse = await MenuService.detail(Number(menuId));
        if (res.status && res.data) {
          const menu: Menu = res.data;

          form.setFieldsValue({
            name: menu.name,
            link: menu.link ?? "",
            type: menu.type as FormValues["type"],
            position: menu.position,
            parent_id: menu.parent_id ?? undefined,
            statusSwitch: menu.status === 1,
          });
        } else {
          message.error(res.message || "Menu không tồn tại!");
          router.push("/admin/menu");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        message.error("Lỗi khi tải dữ liệu menu!");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [menuId, form, router]);

  /* ================= UPDATE ================= */
  const onFinish = async (values: FormValues) => {
    try {
      setSubmitting(true);

      const payload = {
        name: values.name,
        link: values.link || null,
        type: values.type,
        position: values.position,
        parent_id: values.parent_id ? Number(values.parent_id) : 0,
        status: values.statusSwitch ? 1 : 0,
      };

      const res: ServiceResponse = await MenuService.update(Number(menuId), payload);

      if (res.status) {
        message.success("Cập nhật menu thành công!");
        router.push("/admin/menu");
      } else {
        // Đã thay thế (res as any).message bằng res.message nhờ interface ServiceResponse
        const errorMsg = res.message || "Cập nhật thất bại!";
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Update error:", error);
      message.error("Lỗi hệ thống khi cập nhật!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <Card
        title={<span className="text-xl font-bold">Chỉnh sửa Menu</span>}
        className="max-w-2xl mx-auto shadow-md"
      >
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            disabled={loading || submitting}
          >
            <Form.Item
              label="Tên Menu"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên menu" }]}
            >
              <Input placeholder="Nhập tên hiển thị của menu" />
            </Form.Item>

            <Form.Item label="Đường dẫn (Link)" name="link">
              <Input placeholder="Ví dụ: /danh-muc/san-pham" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Loại Menu"
                name="type"
                rules={[{ required: true, message: "Vui lòng chọn loại" }]}
              >
                <Select placeholder="Chọn loại menu">
                  <Option value="category">Category</Option>
                  <Option value="topic">Topic</Option>
                  <Option value="post">Post</Option>
                  <Option value="custom">Custom</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Vị trí"
                name="position"
                rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
              >
                <Select placeholder="Chọn vị trí hiển thị">
                  <Option value="admin">Admin</Option>
                  <Option value="header">Header</Option>
                  <Option value="footer">Footer</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item label="Menu cha (ID)" name="parent_id">
              <InputNumber
                className="w-full"
                placeholder="Để trống nếu là menu cấp 1"
                min={0}
              />
            </Form.Item>

            <Form.Item
              label="Trạng thái hiển thị"
              name="statusSwitch"
              valuePropName="checked"
            >
              <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
            </Form.Item>

            <hr className="my-6 border-gray-100" />

            <Form.Item className="mb-0">
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => router.push("/admin/menu")}
                  disabled={submitting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}