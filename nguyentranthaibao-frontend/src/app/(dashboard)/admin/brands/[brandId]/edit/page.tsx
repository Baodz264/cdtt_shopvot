"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { useParams, useRouter } from "next/navigation";
import BrandService from "@/services/BrandService";
import { useToast } from "@/context/ToastProvider"; // <-- import toast

const { Option } = Select;

interface BrandForm {
  name: string;
  slug: string;
  status: 0 | 1;
}

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast(); // <-- hook toast
  const id = Number(params.brandId);

  const [form] = Form.useForm<BrandForm>();
  const [preview, setPreview] = useState<string>("/no-image.jpg");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldsValue({
      slug: generateSlug(e.target.value),
    });
  };

  useEffect(() => {
    if (!id) return;

    const loadBrand = async () => {
      try {
        const data = await BrandService.get(id);

        form.setFieldsValue({
          name: data.name,
          slug: data.slug,
          status: (data.status ?? 1) as 0 | 1,
        });

        setPreview(data.image ? `http://localhost:8000${data.image}` : "/no-image.jpg");
      } catch (error) {
        console.error(error);
        toast.error("Không tải được dữ liệu brand!"); // <-- toast error
      }
    };

    loadBrand();
  }, [id, form, toast]);

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
      await BrandService.update(id, {
        name: values.name,
        slug: values.slug,
        status: values.status,
        image: imageFile ?? undefined,
      });

      toast.success("Cập nhật brand thành công!"); // <-- toast success
      router.push("/admin/brands");
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật brand!"); // <-- toast error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
      <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
        ✏️ Chỉnh sửa Brand
      </h1>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 1 }}>
        <Form.Item
          label="Tên Brand"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input size="large" onChange={handleNameChange} />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[{ required: true, message: "Slug không được để trống" }]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item label="Ảnh">
          <div className="w-36 h-36 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-4 overflow-hidden bg-gray-50">
            <img src={preview} className="object-cover w-full h-full" />
          </div>

          <Upload showUploadList={false} beforeUpload={handleUpload} accept="image/*">
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Trạng thái" name="status">
          <Select size="large">
            <Option value={1}>Hiện</Option>
            <Option value={0}>Ẩn</Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading} size="large" className="w-full">
          Cập nhật Brand
        </Button>
      </Form>
    </div>
  );
}
