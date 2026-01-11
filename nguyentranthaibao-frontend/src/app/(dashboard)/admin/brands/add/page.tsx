"use client";

import { useState } from "react";
import { Form, Input, Button, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import BrandService from "@/services/BrandService";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastProvider"; // <-- import toast

interface BrandForm {
  name: string;
  slug: string;
  status: 0 | 1;
}

const { Option } = Select;

export default function AddBrandPage() {
  const [form] = Form.useForm<BrandForm>();
  const [preview, setPreview] = useState("/no-image.jpg");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast(); // <-- hook toast

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldsValue({ slug: generateSlug(e.target.value) });
  };

  const handleUpload: UploadProps["beforeUpload"] = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    return false;
  };

  const onFinish = async (values: BrandForm) => {
    try {
      setLoading(true);
      await BrandService.create({
        name: values.name,
        slug: values.slug,
        image: imageFile ?? undefined,
        status: values.status,
      });

      toast.success("Thêm Brand thành công!"); // <-- dùng toast

      router.push("/admin/brands");
    } catch (error) {
      console.error(error);
      toast.error("Không thể thêm Brand!"); // <-- dùng toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
      <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
        ➕ Thêm Brand
      </h1>

      <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-4">
        <Form.Item label="Tên Brand" name="name" rules={[{ required: true }]}>
          <Input size="large" className="rounded-lg" onChange={handleNameChange} />
        </Form.Item>

        <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
          <Input size="large" className="rounded-lg" />
        </Form.Item>

        <Form.Item label="Ảnh">
          <div className="w-36 h-36 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-4 overflow-hidden bg-gray-50">
            <img src={preview} className="object-cover w-full h-full" />
          </div>
          <Upload showUploadList={false} beforeUpload={handleUpload} accept="image/*">
            <Button size="large" icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Trạng thái" name="status" initialValue={1}>
          <Select size="large" className="rounded-lg">
            <Option value={1}>Hiện</Option>
            <Option value={0}>Ẩn</Option>
          </Select>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          className="w-full rounded-lg shadow-md"
        >
          Lưu Brand
        </Button>
      </Form>
    </div>
  );
}
