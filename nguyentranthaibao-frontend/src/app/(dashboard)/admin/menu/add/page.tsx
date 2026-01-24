"use client";

import { useRouter } from "next/navigation";
import { Card, Form, Input, Select, Button, Switch, message } from "antd";
import MenuService, { MenuCreateRequest } from "@/services/MenuService";

const { Option } = Select;

export default function AddMenuPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: MenuCreateRequest & { statusSwitch: boolean }) => {
    try {
      const payload: MenuCreateRequest = {
        name: values.name,
        link: values.link || null,
        type: values.type,
        position: values.position,
        parent_id: values.parent_id || null,
        status: values.statusSwitch ? 1 : 0
      };

      const res = await MenuService.create(payload);

      if (res.status) {
        message.success("Thêm menu thành công!");
        router.push("/admin/menu");
      } else {
        message.error("Thêm menu thất bại!");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi gọi API!");
    }
  };

  return (
    <Card title="Thêm Menu" className="max-w-2xl">
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{
          type: "custom",
          position: "admin",
          statusSwitch: true
        }}
      >
        <Form.Item
          label="Tên Menu"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên menu" }]}
        >
          <Input placeholder="Nhập tên menu" />
        </Form.Item>

        <Form.Item label="Link" name="link">
          <Input placeholder="/admin/products" />
        </Form.Item>

        <Form.Item
          label="Loại"
          name="type"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="category">Category</Option>
            <Option value="topic">Topic</Option>
            <Option value="post">Post</Option>
            <Option value="custom">Custom</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Menu cha" name="parent_id">
          <Input type="number" placeholder="ID menu cha (nếu có)" />
        </Form.Item>

        <Form.Item
          label="Vị trí"
          name="position"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="admin">Admin</Option>
            <Option value="header">Header</Option>
            <Option value="footer">Footer</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Trạng thái" name="statusSwitch" valuePropName="checked">
          <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm Menu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
