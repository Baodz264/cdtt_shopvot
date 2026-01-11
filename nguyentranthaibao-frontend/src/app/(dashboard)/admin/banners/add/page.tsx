"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, message, Upload } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import BannerService from "@/services/BannerService";

const { Option } = Select;

export default function AddBannerPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [position, setPosition] = useState("top");
  const [status, setStatus] = useState<0 | 1>(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      message.error("Vui lòng chọn hình ảnh");
      return;
    }

    try {
      setLoading(true);
      await BannerService.create({
        name,
        link,
        image,
        position,
        status,
      });

      message.success("Thêm banner thành công");
      router.push("/admin/banners");
    } catch (error) {
      message.error("Thêm banner thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Thêm Banner</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block mb-1 font-medium">Tên Banner</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className="block mb-1 font-medium">Link</label>
          <Input value={link} onChange={(e) => setLink(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1 font-medium">Hình ảnh</label>
          <Upload
            beforeUpload={(file) => {
              setImage(file);
              return false; // không upload tự động
            }}
            maxCount={1}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Vị trí</label>
            <Select value={position} onChange={setPosition} className="w-full">
              <Option value="top">Top</Option>
              <Option value="middle">Middle</Option>
              <Option value="bottom">Bottom</Option>
            </Select>
          </div>

          <div className="flex-1">
            <label className="block mb-1 font-medium">Trạng thái</label>
            <Select value={status} onChange={setStatus} className="w-full">
              <Option value={1}>Hiển thị</Option>
              <Option value={0}>Ẩn</Option>
            </Select>
          </div>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          icon={<PlusOutlined />}
          loading={loading}
          className="w-full"
        >
          Thêm Banner
        </Button>
      </form>
    </div>
  );
}
