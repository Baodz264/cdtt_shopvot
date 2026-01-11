"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Input, Select, message, Upload, Image } from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import BannerService, { Banner } from "@/services/BannerService";

const { Option } = Select;
const IMAGE_BASE = "http://localhost:8000"; // backend url

export default function EditBannerPage() {
  const router = useRouter();
  const { bannerId } = useParams<{ bannerId: string }>();

  const [banner, setBanner] = useState<Banner | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    BannerService.get(Number(bannerId)).then(setBanner);
  }, [bannerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banner) return;

    try {
      setLoading(true);
      await BannerService.update(banner.id, {
        name: banner.name,
        link: banner.link || undefined,
        position: banner.position,
        status: banner.status,
        image: newImage || undefined,
      });

      message.success("Cập nhật banner thành công");
      router.push("/admin/banners");
    } catch {
      message.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!banner) return null;

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Sửa Banner</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block mb-1 font-medium">Tên Banner</label>
          <Input
            value={banner.name}
            onChange={(e) => setBanner({ ...banner, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Link</label>
          <Input
            value={banner.link || ""}
            onChange={(e) => setBanner({ ...banner, link: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Ảnh hiện tại</label>
          <Image
            src={`${IMAGE_BASE}/${banner.image}`}
            width="100%"
            className="rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Đổi ảnh mới</label>
          <Upload
            beforeUpload={(file) => {
              setNewImage(file);
              return false;
            }}
            maxCount={1}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
          </Upload>
        </div>

        <div className="flex gap-4">
          <Select
            value={banner.position}
            onChange={(value) => setBanner({ ...banner, position: value })}
            className="flex-1"
          >
            <Option value="top">Top</Option>
            <Option value="middle">Middle</Option>
            <Option value="bottom">Bottom</Option>
          </Select>

          <Select
            value={banner.status}
            onChange={(value) => setBanner({ ...banner, status: value })}
            className="flex-1"
          >
            <Option value={1}>Hiển thị</Option>
            <Option value={0}>Ẩn</Option>
          </Select>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          icon={<EditOutlined />}
          loading={loading}
          className="w-full"
        >
          Cập nhật Banner
        </Button>
      </form>
    </div>
  );
}
