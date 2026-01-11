"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import type { UploadProps } from "antd";
import CategoryService from "@/services/CategoryService";
import { useToast } from "@/context/ToastProvider";

interface CategoryForm {
  name: string;
  slug: string;
}

export default function EditCategory() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.categoryId);

  const toast = useToast(); // dùng toast thay message
  const [form] = Form.useForm<CategoryForm>();
  const [preview, setPreview] = useState("/no-image.jpg");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Hàm tạo slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slugValue = generateSlug(e.target.value);
    form.setFieldsValue({ slug: slugValue });
  };

  // Load category data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await CategoryService.get(id);

        form.setFieldsValue({
          name: data.name,
          slug: data.slug,
        });

        setPreview(
          data.image ? `http://localhost:8000${data.image}` : "/no-image.jpg"
        );
      } catch (error) {
        console.log(error);
        toast.error("Không tải được dữ liệu danh mục!"); // dùng toast
      }
    };

    loadData();
  }, [id, form, toast]);

  // Upload ảnh
  const handleUpload: UploadProps["beforeUpload"] = (file) => {
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    return false;
  };

  // Submit
  const onFinish = async (values: CategoryForm) => {
    try {
      await CategoryService.update(id, {
        name: values.name,
        slug: values.slug,
        image: imageFile ?? undefined,
        status: 1,
      });

      toast.success("Cập nhật danh mục thành công!"); // dùng toast
      router.push("/admin/categories");
    } catch (error) {
      console.log(error);
      toast.error("Cập nhật thất bại!"); // dùng toast
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
      <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
        ✏️ Sửa Danh Mục
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-4"
      >
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
        >
          <Input
            size="large"
            onChange={handleNameChange}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[{ required: true, message: "Slug không được để trống" }]}
        >
          <Input size="large" className="rounded-lg" />
        </Form.Item>

        <Form.Item label="Ảnh">
          <div className="w-36 h-36 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-3 overflow-hidden bg-gray-50 hover:bg-gray-100 transition">
            <img src={preview} className="object-cover w-full h-full" />
          </div>

          <Upload
            beforeUpload={handleUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} size="large" className="rounded-lg">
              Chọn ảnh
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full rounded-lg shadow-md"
          >
            Cập Nhật Danh Mục
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
