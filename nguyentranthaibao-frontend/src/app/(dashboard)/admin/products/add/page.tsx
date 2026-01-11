"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, InputNumber, Button, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ProductService, { ProductPayload } from "@/services/ProductService";
import BrandService, { Brand } from "@/services/BrandService";
import CategoryService, { Category } from "@/services/CategoryService";
import { useToast } from "@/context/ToastProvider"; // <-- import useToast

export interface ProductForm {
  brand_id?: number;
  category_id?: number;
  name: string;
  price: number;
  sale_price?: number;
  stock: number;
  description?: string;
}

export default function ProductAdd() {
  const router = useRouter();
  const toast = useToast(); // <-- hook toast
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form] = Form.useForm<ProductForm>();

  useEffect(() => {
    const loadData = async () => {
      try {
        const brandRes = await BrandService.list({ status: 1 });
        setBrands(brandRes.data);

        const categoryRes = await CategoryService.list({ status: 1 });
        setCategories(categoryRes.data);
      } catch {
        toast.error("Không tải được Brand/Category"); // <-- dùng toast
      }
    };
    loadData();
  }, []);

  // Tạo SKU tự động
  const generateSku = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 900 + 100); // 100-999
    return `SP${timestamp}${random}`;
  };

  const handleSubmit = async (values: ProductForm) => {
    try {
      setLoading(true);
      const payload: ProductPayload = {
        ...values,
        status: 1,
        sku: generateSku(),
        thumbnail: file,
      };
      await ProductService.create(payload);
      toast.success("Thêm sản phẩm thành công!"); // <-- dùng toast
      router.push("/admin/products");
    } catch {
      toast.error("Lỗi thêm sản phẩm"); // <-- dùng toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <h1 className="text-3xl font-semibold mb-8 text-gray-900 tracking-tight">
          Thêm sản phẩm mới
        </h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="grid grid-cols-2 gap-6"
        >
          {/* LEFT */}
          <div className="col-span-1 space-y-4">
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
            >
              <Input size="large" className="rounded-lg" placeholder="Tên sản phẩm..." />
            </Form.Item>

            <Form.Item
              label="Brand"
              name="brand_id"
              rules={[{ required: true, message: "Chọn Brand" }]}
            >
              <Select placeholder="Chọn Brand" className="w-full rounded-lg">
                {brands.map((b) => (
                  <Select.Option key={b.id} value={b.id}>
                    {b.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Category"
              name="category_id"
              rules={[{ required: true, message: "Chọn Category" }]}
            >
              <Select placeholder="Chọn Category" className="w-full rounded-lg">
                {categories.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Giá" name="price" rules={[{ required: true }]}>
              <InputNumber size="large" min={0} className="w-full rounded-lg" />
            </Form.Item>

            <Form.Item label="Giá Sale" name="sale_price">
              <InputNumber size="large" min={0} className="w-full rounded-lg" />
            </Form.Item>

            <Form.Item label="Số lượng (Stock)" name="stock">
              <InputNumber size="large" min={0} className="w-full rounded-lg" />
            </Form.Item>
          </div>

          {/* RIGHT */}
          <div className="col-span-1 space-y-4">
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={7} className="rounded-lg" placeholder="Mô tả chi tiết..." />
            </Form.Item>

            <Form.Item label="Ảnh Thumbnail">
              <Upload
                listType="picture-card"
                beforeUpload={(f: File) => {
                  setFile(f);
                  return false;
                }}
                maxCount={1}
              >
                <div className="text-center text-gray-700">
                  <UploadOutlined className="text-2xl" />
                  <p className="mt-1">Chọn ảnh</p>
                </div>
              </Upload>
            </Form.Item>
          </div>

          {/* SUBMIT */}
          <div className="col-span-2 mt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full h-12 rounded-xl text-base font-semibold
              bg-gradient-to-r from-blue-500 to-indigo-600
              hover:opacity-90 transition-all duration-200"
            >
              Thêm sản phẩm
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
