"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Button, Space, Popconfirm, message, Card } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import MenuService, { Menu } from "@/services/MenuService";

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Lấy danh sách menu từ API
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await MenuService.list({ page: 1, limit: 50 });
      if (res.status) {
        setMenus(res.data);
      } else {
        message.error("Lấy danh sách menu thất bại!");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi gọi API!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Toggle status menu
  const toggleStatus = async (menu: Menu) => {
    try {
      const updatedStatus = menu.status ? 0 : 1;
      const res = await MenuService.update(menu.id, { status: updatedStatus });
      if (res.status) {
        setMenus(prev =>
          prev.map(m => (m.id === menu.id ? { ...m, status: updatedStatus } : m))
        );
        message.success("Cập nhật trạng thái thành công!");
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  // Xóa menu
  const deleteMenu = async (id: number) => {
    try {
      const res = await MenuService.delete(id);
      if (res.status) {
        setMenus(prev => prev.filter(m => m.id !== id));
        message.success("Xóa menu thành công!");
      } else {
        message.error("Xóa thất bại!");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi xóa menu!");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tên Menu", dataIndex: "name", key: "name" },
    { title: "Link", dataIndex: "link", key: "link", render: (link: string) => <a href={link} className="text-blue-600">{link}</a> },
    { title: "Loại", dataIndex: "type", key: "type" },
    { title: "Vị trí", dataIndex: "position", key: "position" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_: number, record: Menu) => (
        <Button
          size="small"
          icon={record.status ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          onClick={() => toggleStatus(record)}
        >
          {record.status ? "Hiển thị" : "Ẩn"}
        </Button>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: Menu) => (
        <Space size="middle">
          <Link href={`/admin/menu/${record.id}/edit`}>
            <Button icon={<EditOutlined />} type="default">
              Sửa
            </Button>
          </Link>
          <Popconfirm
            title="Bạn có chắc muốn xóa menu này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMenu(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card className="p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách Menu</h1>
        <Link href="/admin/menu/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm Menu
          </Button>
        </Link>
      </div>

      <Table
        rowKey="id"
        dataSource={menus}
        columns={columns}
        bordered
        size="middle"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
