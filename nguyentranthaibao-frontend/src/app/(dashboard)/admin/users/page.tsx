"use client";

import { useState, useEffect } from "react";
import { Table, Button, Tag, Space, Popconfirm, Image, Pagination, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import UserService, { User, PaginatedResponse } from "@/services/UserService";
import { useToast } from "@/context/ToastProvider"; // <-- import toast

const BACKEND_URL = "http://localhost:8000";

export default function UserListPage() {
  const router = useRouter();
  const toast = useToast(); // <-- hook toast
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchUsers = async (page = 1, limit = pageSize, keyword = search) => {
    try {
      setLoading(true);
      const data: PaginatedResponse<User> = await UserService.list({
        page,
        limit,
        search: keyword,
      });
      setUsers(data.data);
      setCurrentPage(data.page);
      setPageSize(data.limit);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách người dùng!"); // <-- toast error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, pageSize);
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await UserService.delete(id);
      toast.success("Đã xóa người dùng!"); // <-- toast success
      if (users.length === 1 && currentPage > 1) {
        fetchUsers(currentPage - 1, pageSize, search);
      } else {
        fetchUsers(currentPage, pageSize, search);
      }
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại!"); // <-- toast error
    }
  };

  const columns: ColumnsType<User> = [
    { title: "ID", dataIndex: "id", align: "center", width: 60 },
    {
      title: "Avatar",
      dataIndex: "avatar",
      align: "center",
      render: (src: string) => (
        <Image
          src={src ? encodeURI(BACKEND_URL + src) : "/no-avatar.png"}
          width={40}
          height={40}
          style={{ borderRadius: "50%", objectFit: "cover" }}
          fallback="/no-avatar.png"
          alt="avatar"
        />
      ),
    },
    { title: "Tên", dataIndex: "name", render: (text: string) => <span className="font-medium">{text}</span> },
    { title: "Email", dataIndex: "email" },
    { title: "Điện thoại", dataIndex: "phone", align: "center" },
    { title: "Role", dataIndex: "role", align: "center", render: (role: string) => role.toUpperCase() },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status: number) => (status ? <Tag color="green">Hiển thị</Tag> : <Tag color="gray">Ẩn</Tag>),
    },
    { title: "Ngày tạo", dataIndex: "created_at", align: "center" },
    {
      title: "Hành động",
      align: "center",
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Button type="link" onClick={() => router.push(`/admin/users/${record.id}/show`)}>
            Xem
          </Button>
          <Button type="link" onClick={() => router.push(`/admin/users/${record.id}/edit`)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id!)}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách người dùng</h2>
        <Button type="primary" size="small" onClick={() => router.push("/admin/users/add")}>
          + Thêm người dùng
        </Button>
      </div>

      <div className="mb-4 flex justify-end">
        <Input.Search
          placeholder="Tìm người dùng..."
          allowClear
          onSearch={(value) => {
            setSearch(value);
            fetchUsers(1, pageSize, value);
          }}
          style={{ width: 250 }}
        />
      </div>

      <Table
        size="small"
        bordered
        rowKey="id"
        columns={columns}
        dataSource={users}
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
          onChange={(page, size) => fetchUsers(page, size, search)}
          onShowSizeChange={(current, size) => fetchUsers(1, size, search)}
          showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} người dùng`}
        />
      </div>
    </div>
  );
}
