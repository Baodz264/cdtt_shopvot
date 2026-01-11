"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Tag, Button, Card, Space, Popconfirm } from "antd"; // thêm Space, Popconfirm
import ContactService, { Contact, PaginatedContacts } from "@/services/ContactService";
import { useToast } from "@/context/ToastProvider"; // <-- import toast

export default function AdminContactsPage() {
  const toast = useToast(); // <-- sử dụng toast
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Lấy danh sách contact từ API
  const fetchContacts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res: PaginatedContacts = await ContactService.list({ page, limit });
      setContacts(res.data);
      setPagination({ page: res.page, limit: res.limit, total: res.total });
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lấy danh sách liên hệ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(pagination.page, pagination.limit);
  }, []);

  // Toggle status contact
  const toggleStatus = async (contact: Contact) => {
    try {
      const newStatus = contact.status === 1 ? 0 : 1;
      await ContactService.update(contact.id, { status: newStatus });
      setContacts(prev =>
        prev.map(c => (c.id === contact.id ? { ...c, status: newStatus } : c))
      );
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  // Xóa contact
  const deleteContact = async (id: number) => {
    try {
      await ContactService.delete(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success("Xóa liên hệ thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Xóa liên hệ thất bại!");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Họ tên", dataIndex: "fullname", key: "fullname" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_: number, record: Contact) => (
        <Button
          size="small"
          type={record.status === 1 ? "default" : "primary"}
          onClick={() => toggleStatus(record)}
        >
          {record.status === 1 ? "Đã trả lời" : "Chưa trả lời"}
        </Button>
      ),
    },
    { title: "Ngày gửi", dataIndex: "created_at", key: "created_at" },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: Contact) => (
        <Space>
          <Link href={`/admin/contacts/${record.id}/edit`}>
            <Button type="primary" size="small">
              Trả lời
            </Button>
          </Link>
          <Popconfirm
            title="Xóa liên hệ này?"
            onConfirm={() => deleteContact(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card className="p-4 shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Danh sách liên hệ</h1>
      <Table
        rowKey="id"
        dataSource={contacts}
        columns={columns}
        loading={loading}
        bordered
        size="middle"
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          onChange: (page, pageSize) => fetchContacts(page, pageSize),
        }}
      />
    </Card>
  );
}
