"use client";

import { useState } from "react";
import { Card, Image, Button, Space, Popconfirm, Tooltip, Checkbox } from "antd";
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const IMAGE_BASE = "http://localhost:8000";

interface ProductImage {
  id: number;
  image: string;
}

interface Props {
  images: ProductImage[];
  onAdd(): void;
  onEdit(img: ProductImage): void;
  onDelete(id: number): void;
  onDeleteMultiple(ids: number[]): void;
  onReload(): void;
}

export default function ProductImagesCard({
  images,
  onAdd,
  onEdit,
  onDelete,
  onDeleteMultiple,
  onReload,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <Card
      title={
        <div className="flex items-center gap-2 text-lg font-semibold">
          🖼️ Hình ảnh sản phẩm
          <span className="text-sm text-gray-400">({images.length})</span>
        </div>
      }
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 border-none font-medium"
          >
            Thêm ảnh
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              onReload();
              clearSelection();
            }}
            className="bg-gray-100 hover:bg-gray-200 border-none font-medium"
          >
            Tải lại
          </Button>

          {selectedIds.length > 0 && (
            <Popconfirm
              title={`Xoá ${selectedIds.length} ảnh đã chọn?`}
              okText="Xoá"
              cancelText="Huỷ"
              onConfirm={() => {
                onDeleteMultiple(selectedIds);
                clearSelection();
              }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                className="bg-red-600 hover:bg-red-700 border-none font-medium"
              >
                Xoá đã chọn ({selectedIds.length})
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
      className="rounded-2xl shadow-xl border-none"
      styles={{ body: { padding: 24 } }}
    >
      {images.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3 animate-pulse">🖼️</div>
          Chưa có hình ảnh nào
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative rounded-xl overflow-hidden shadow hover:shadow-2xl transition duration-300 bg-gray-50 group"
            >
              {/* Checkbox */}
              <Checkbox
                checked={selectedIds.includes(img.id)}
                onChange={() => toggleSelect(img.id)}
                className={`absolute top-2 left-2 z-20 w-5 h-5 border-white border-2 rounded-full shadow-lg transition-transform duration-200
                  ${selectedIds.includes(img.id) ? "scale-110" : "scale-100"} bg-white`}
              />

              {/* Image */}
              <div className="w-full h-36 overflow-hidden">
                <Image
                  src={`${IMAGE_BASE}${img.image.startsWith("/") ? "" : "/"}${img.image}`}
                  preview={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />

              {/* Action buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Tooltip title="Sửa ảnh">
                  <Button
                    size="small"
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(img)}
                    className="bg-white hover:bg-blue-50 border-none shadow-lg"
                  />
                </Tooltip>

                <Popconfirm
                  title="Xoá ảnh này?"
                  okText="Xoá"
                  cancelText="Huỷ"
                  onConfirm={() => onDelete(img.id)}
                >
                  <Tooltip title="Xoá ảnh">
                    <Button
                      danger
                      size="small"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      className="shadow-lg"
                    />
                  </Tooltip>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
