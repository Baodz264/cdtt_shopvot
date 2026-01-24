"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Card,
  Input,
  Select,
  Row,
  Col
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import MenuService, { Menu, MenuListParams } from "@/services/MenuService";

const { Search } = Input;
const { Option } = Select;

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // filters
  const [filters, setFilters] = useState<MenuListParams>({
    search: "",
    status: undefined,
    type: undefined,
    position: undefined
  });

  /* ================= FETCH DATA ================= */
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await MenuService.list({
        page,
        limit,
        ...filters
      });

      if (res.status) {
        setMenus(res.data);
        setTotal(res.total);
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
  }, [page, limit, filters]);

  /* ================= ACTIONS ================= */
  const toggleStatus = async (menu: Menu) => {
    try {
      const updatedStatus = menu.status ? 0 : 1;
      const res = await MenuService.update(menu.id, {
        status: updatedStatus
      });

      if (res.status) {
        setMenus(prev =>
          prev.map(m =>
            m.id === menu.id ? { ...m, status: updatedStatus } : m
          )
        );
        message.success("Cập nhật trạng thái thành công!");
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch {
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  const deleteMenu = async (id: number) => {
    try {
      const res = await MenuService.delete(id);
      if (res.status) {
        message.success("Xóa menu thành công!");
        fetchMenus();
      } else {
        message.error("Xóa thất bại!");
      }
    } catch {
      message.error("Lỗi khi xóa menu!");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },

    { title: "Tên Menu", dataIndex: "name", key: "name" },

    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (link: string) =>
        link ? (
          <a href={link} className="text-blue-600" target="_blank">
            {link}
          </a>
        ) : (
          "-"
        )
    },

    { title: "Loại", dataIndex: "type", key: "type" },

    { title: "Vị trí", dataIndex: "position", key: "position" },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (_: number, record: Menu) => (
        <Button
          size="small"
          icon={record.status ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          onClick={() => toggleStatus(record)}
        >
          {record.status ? "Hiển thị" : "Ẩn"}
        </Button>
      )
    },

    {
      title: "Hành động",
      key: "actions",
      width: 200,
      render: (_: unknown, record: Menu) => (
        <Space>
          <Link href={`/admin/menu/${record.id}/edit`}>
            <Button icon={<EditOutlined />}>Sửa</Button>
          </Link>

          <Popconfirm
            title="Bạn có chắc muốn xóa menu này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMenu(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  /* ================= RENDER ================= */
  return (
    <Card className="shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Danh sách Menu</h1>

      {/* ===== FILTER ===== */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Search
            placeholder="Tìm theo tên / link"
            allowClear
            onSearch={value =>
              setFilters(prev => ({ ...prev, search: value }))
            }
          />
        </Col>

        <Col span={4}>
          <Select
            allowClear
            placeholder="Trạng thái"
            className="w-full"
            onChange={value =>
              setFilters(prev => ({ ...prev, status: value }))
            }
          >
            <Option value={1}>Hiển thị</Option>
            <Option value={0}>Ẩn</Option>
          </Select>
        </Col>

        <Col span={5}>
          <Select
            allowClear
            placeholder="Loại menu"
            className="w-full"
            onChange={value =>
              setFilters(prev => ({ ...prev, type: value }))
            }
          >
            <Option value="category">Category</Option>
            <Option value="topic">Topic</Option>
            <Option value="post">Post</Option>
            <Option value="custom">Custom</Option>
          </Select>
        </Col>

        <Col span={5}>
          <Input
            placeholder="Vị trí (admin, header...)"
            allowClear
            onChange={e =>
              setFilters(prev => ({ ...prev, position: e.target.value }))
            }
          />
        </Col>

        <Col span={4}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setFilters({});
                setPage(1);
              }}
            >
              Reset
            </Button>

            <Link href="/admin/menu/add">
              <Button type="primary" icon={<PlusOutlined />}>
                Thêm Menu
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>

      {/* ===== TABLE ===== */}
      <Table
        rowKey="id"
        dataSource={menus}
        columns={columns}
        loading={loading}
        bordered
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: (p, ps) => {
            setPage(p);
            setLimit(ps);
          }
        }}
      />
    </Card>
  );
}
