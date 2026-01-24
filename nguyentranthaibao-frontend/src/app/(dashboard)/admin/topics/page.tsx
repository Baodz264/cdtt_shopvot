"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Popconfirm,
  Tag,
  Space,
  Card,
  Pagination,
  Input,
  Select,
} from "antd";
import Link from "next/link";
import TopicService, {
  Topic,
  PaginatedResponse,
} from "@/services/TopicService";
import { useToast } from "@/context/ToastProvider";

export default function TopicList() {
  const router = useRouter();
  const toast = useToast();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  // ===== Filter & Search =====
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<number | undefined>(undefined);

  // ===========================
  // Lấy danh sách topic từ API
  // ===========================
  const fetchTopics = async (
    page = 1,
    limit = pageSize,
    extra?: {
      keyword?: string;
      status?: number;
    }
  ) => {
    try {
      setLoading(true);

      const res: PaginatedResponse<Topic> = await TopicService.list({
        page,
        limit,
        keyword: extra?.keyword,
        status: extra?.status,
      });

      setTopics(res.data);
      setCurrentPage(res.page);
      setPageSize(res.limit);
      setTotal(res.total);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách topic!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // ===========================
  // Xóa topic
  // ===========================
  const handleDelete = async (id: number) => {
    try {
      await TopicService.delete(id);
      toast.success("Xóa topic thành công!");
      fetchTopics(currentPage, pageSize, { keyword, status });
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại!");
    }
  };

  const columns = [
    {
      title: "Tên Topic",
      dataIndex: "name",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    { title: "Slug", dataIndex: "slug" },
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
    { title: "Ngày tạo", dataIndex: "created_at" },
    {
      title: "Thao tác",
      render: (_: unknown, record: Topic) => (
        <Space size="small">
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() =>
              router.push(`/admin/topics/${record.id}/edit`)
            }
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id!)}
          >
            <Button type="link" danger style={{ padding: 0 }}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card className="p-4 shadow-sm">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách Topic</h2>
        <Link href="/admin/topics/add">
          <Button type="primary" size="small">
            + Thêm
          </Button>
        </Link>
      </div>

      {/* ===== Filter ===== */}
      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Tìm theo tên topic..."
          value={keyword}
          allowClear
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() =>
            fetchTopics(1, pageSize, { keyword, status })
          }
        />

        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 160 }}
          value={status}
          onChange={(value) => setStatus(value)}
          options={[
            { label: "Hiển thị", value: 1 },
            { label: "Ẩn", value: 0 },
          ]}
        />

        <Button
          type="primary"
          onClick={() =>
            fetchTopics(1, pageSize, { keyword, status })
          }
        >
          Lọc
        </Button>

        <Button
          onClick={() => {
            setKeyword("");
            setStatus(undefined);
            fetchTopics(1, pageSize);
          }}
        >
          Reset
        </Button>
      </div>

      {/* ===== Table ===== */}
      <Table
        size="small"
        bordered
        rowKey="id"
        columns={columns}
        dataSource={topics}
        loading={loading}
        pagination={false}
      />

      {/* ===== Pagination ===== */}
      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          onChange={(page, size) =>
            fetchTopics(page, size, { keyword, status })
          }
          onShowSizeChange={(current, size) =>
            fetchTopics(1, size, { keyword, status })
          }
          pageSizeOptions={["5", "10", "20", "50"]}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} topic`
          }
        />
      </div>
    </Card>
  );
}
