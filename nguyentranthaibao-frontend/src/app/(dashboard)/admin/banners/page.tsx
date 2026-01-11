"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Tag,
  Space,
  Popconfirm,
  Image,
  message,
  Pagination,
} from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import BannerService, {
  Banner,
  PaginatedBanners,
} from "@/services/BannerService";

const IMAGE_BASE = "http://localhost:8000";

export default function BannerList() {
  const router = useRouter();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  // =============================
  // Fetch banners
  // =============================
  const fetchBanners = async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);
      const res: PaginatedBanners = await BannerService.list({
        page,
        limit,
      });

      setBanners(res.data);
      setTotal(res.total);
      setCurrentPage(res.page);
      setPageSize(res.limit);
    } catch (error) {
      console.error(error);
      message.error("Không tải được danh sách banner!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners(1, pageSize);
  }, []);

  // =============================
  // Toggle status
  // =============================
  const toggleStatus = async (banner: Banner) => {
    try {
      await BannerService.update(banner.id, {
        status: banner.status ? 0 : 1,
      });
      message.success("Đã cập nhật trạng thái");
      fetchBanners(currentPage, pageSize);
    } catch {
      message.error("Cập nhật trạng thái thất bại!");
    }
  };

  // =============================
  // Delete banner
  // =============================
  const handleDelete = async (id: number) => {
    try {
      await BannerService.delete(id);
      message.success("Đã xóa banner");

      if (banners.length === 1 && currentPage > 1) {
        fetchBanners(currentPage - 1, pageSize);
      } else {
        fetchBanners(currentPage, pageSize);
      }
    } catch {
      message.error("Xóa banner thất bại!");
    }
  };

  // =============================
  // Columns
  // =============================
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      width: 80,
      render: (src: string | null | undefined) => (
        <Image
          src={
            src
              ? `${IMAGE_BASE}/${src.replace(/^\/+/, "")}`
              : "/no-image.jpg"
          }
          width={60}
          height={60}
          style={{ objectFit: "cover", borderRadius: 6 }}
        />
      ),
    },
    {
      title: "Tên Banner",
      dataIndex: "name",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      render: (pos: string) => <Tag color="blue">{pos}</Tag>,
    },
    {
      title: "Link",
      dataIndex: "link",
      render: (link: string) =>
        link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600"
          >
            {link}
          </a>
        ) : (
          <Tag>Không có</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: number) =>
        status ? (
          <Tag color="green">Hiển thị</Tag>
        ) : (
          <Tag color="gray">Ẩn</Tag>
        ),
    },
    {
      title: "Thao tác",
      width: 260,
      render: (_: unknown, record: Banner) => (
        <Space size="small">
          <Button
            size="small"
            icon={record.status ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => toggleStatus(record)}
          >
            {record.status ? "Ẩn" : "Hiển thị"}
          </Button>

          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              router.push(`/admin/banners/${record.id}/edit`)
            }
          >
            Sửa
          </Button>

          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // =============================
  // Render
  // =============================
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách Banner</h2>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => router.push("/admin/banners/add")}
        >
          Thêm Banner
        </Button>
      </div>

      <Table
        size="small"
        bordered
        rowKey="id"
        columns={columns}
        dataSource={banners}
        loading={loading}
        pagination={false}
      />

      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={["5", "10", "20", "50"]}
          onChange={(page, size) => fetchBanners(page, size)}
          onShowSizeChange={(_, size) => fetchBanners(1, size)}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} banner`
          }
        />
      </div>
    </div>
  );
}
