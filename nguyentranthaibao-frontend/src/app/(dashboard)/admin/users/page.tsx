"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Popconfirm,
  Image,
  Pagination,
  Input,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import UserService, {
  User,
  PaginatedResponse,
  UserListParams,
} from "@/services/UserService";
import { useToast } from "@/context/ToastProvider";

const { Search } = Input;
const { Option } = Select;

const BACKEND_URL = "http://localhost:8000";

export default function UserListPage() {
  const router = useRouter();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  /* ================= FILTER STATE ================= */
  const [search, setSearch] = useState<string>();
  const [role, setRole] = useState<"admin" | "customer" | undefined>();
  const [status, setStatus] = useState<0 | 1 | undefined>();

  /* ================= FETCH ================= */
  const fetchUsers = async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);

      const params: UserListParams = {
        page,
        limit,
        search,
        role,
        status,
      };

      const data: PaginatedResponse<User> = await UserService.list(params);

      setUsers(data.data);
      setCurrentPage(data.page);
      setPageSize(data.limit);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, status]);

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    try {
      await UserService.delete(id);
      toast.success("Đã xóa người dùng!");

      if (users.length === 1 && currentPage > 1) {
        fetchUsers(currentPage - 1, pageSize);
      } else {
        fetchUsers(currentPage, pageSize);
      }
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại!");
    }
  };

  /* ================= TABLE ================= */
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
    {
      title: "Tên",
      dataIndex: "name",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    { title: "Email", dataIndex: "email" },
    { title: "Điện thoại", dataIndex: "phone", align: "center" },
    {
      title: "Role",
      dataIndex: "role",
      align: "center",
      render: (role: string) => (
        <Tag color={role === "admin" ? "blue" : "gold"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status: number) =>
        status ? (
          <Tag color="green">Hiển thị</Tag>
        ) : (
          <Tag color="gray">Ẩn</Tag>
        ),
    },
    { title: "Ngày tạo", dataIndex: "created_at", align: "center" },
    {
      title: "Hành động",
      align: "center",
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Button
            type="link"
            onClick={() =>
              router.push(`/admin/users/${record.id}/show`)
            }
          >
            Xem
          </Button>
          <Button
            type="link"
            onClick={() =>
              router.push(`/admin/users/${record.id}/edit`)
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
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ================= RENDER ================= */
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách người dùng</h2>
        <Button
          type="primary"
          size="small"
          onClick={() => router.push("/admin/users/add")}
        >
          + Thêm người dùng
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3 justify-end">
        <Search
          placeholder="Tìm tên, email, SĐT..."
          allowClear
          onSearch={(value) => setSearch(value || undefined)}
          style={{ width: 220 }}
        />

        <Select
          placeholder="Role"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => setRole(value)}
        >
          <Option value="admin">Admin</Option>
          <Option value="customer">Customer</Option>
        </Select>

        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => setStatus(value)}
        >
          <Option value={1}>Hiển thị</Option>
          <Option value={0}>Ẩn</Option>
        </Select>
      </div>

      {/* Table */}
      <Table
        size="small"
        bordered
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={false}
      />

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={["5", "10", "20", "50"]}
          onChange={(page, size) => fetchUsers(page, size)}
          onShowSizeChange={(_, size) => fetchUsers(1, size)}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} người dùng`
          }
        />
      </div>
    </div>
  );
}
