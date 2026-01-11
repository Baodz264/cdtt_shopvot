"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Form, Input, InputNumber, Button, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ProductService, { ProductPayload } from "@/services/ProductService";
import BrandService, { Brand } from "@/services/BrandService";
import CategoryService, { Category } from "@/services/CategoryService";
import { useToast } from "@/context/ToastProvider"; // <-- import useToast

interface ProductForm {
  brand_id: number;
  category_id: number;
  name: string;
  price: number;
  sale_price?: number;
  stock: number;
  description?: string;
}

export default function ProductEdit() {
  const params = useParams<{ productId: string }>();
  const productId = Number(params.productId);

  const router = useRouter();
  const toast = useToast(); // <-- dùng toast
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form] = Form.useForm<ProductForm>();

  useEffect(() => {
    const load = async () => {
      try {
        const [brandRes, categoryRes, productRes] = await Promise.all([
          BrandService.list({ status: 1 }),
          CategoryService.list({ status: 1 }),
          ProductService.get(productId),
        ]);

        setBrands(brandRes.data);
        setCategories(categoryRes.data);

        const product = productRes.data;
        form.setFieldsValue({
          brand_id: product.brand_id,
          category_id: product.category_id,
          name: product.name,
          price: product.price,
          sale_price: product.sale_price,
          stock: product.stock,
          description: product.description,
        });

        setThumbnailPreview(product.thumbnail_url);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được dữ liệu sản phẩm"); // <-- toast
      }
    };
    load();
  }, [productId, form]);

  const handleSubmit = async (values: ProductForm) => {
    try {
      setLoading(true);

      const payload: ProductPayload = {
        ...values,
        ...(file && { thumbnail: file }), // chỉ gửi nếu upload mới
        status: 1,
      };

      await ProductService.update(productId, payload);
      toast.success("Cập nhật sản phẩm thành công!"); // <-- toast
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi cập nhật sản phẩm"); // <-- toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <h1 className="text-3xl font-semibold mb-8 text-gray-900 tracking-tight">
          ✏ Sửa sản phẩm #{productId}
        </h1>

        {thumbnailPreview && (
          <img
            src={thumbnailPreview}
            className="w-32 h-32 object-cover rounded-xl shadow-md mb-6"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="grid grid-cols-2 gap-6"
        >
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

            <Form.Item label="Số lượng (Stock)" name="stock" rules={[{ required: true }]}>
              <InputNumber size="large" min={0} className="w-full rounded-lg" />
            </Form.Item>
          </div>

          <div className="col-span-1 space-y-4">
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={7} className="rounded-lg" placeholder="Mô tả chi tiết..." />
            </Form.Item>

            <Form.Item label="Ảnh mới (tùy chọn)">
              <Upload
                listType="picture-card"
                beforeUpload={(f: File) => {
                  setFile(f);
                  setThumbnailPreview(URL.createObjectURL(f));
                  return false;
                }}
                maxCount={1}
              >
                <div className="text-center text-gray-700">
                  <UploadOutlined className="text-2xl" />
                  <p className="mt-1">Upload ảnh mới</p>
                </div>
              </Upload>
            </Form.Item>
          </div>

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
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
