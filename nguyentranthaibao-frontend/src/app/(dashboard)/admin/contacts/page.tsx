"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  Button,
  Card,
  Space,
  Popconfirm,
  Input,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import ContactService, {
  Contact,
  PaginatedContacts,
} from "@/services/ContactService";
import { useToast } from "@/context/ToastProvider";

const { Search } = Input;

export default function AdminContactsPage() {
  const toast = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /* ================= PAGINATION ================= */
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  /* ================= FILTER ================= */
  const [keyword, setKeyword] = useState<string>("");
  const [status, setStatus] = useState<0 | 1 | undefined>(undefined);

  /* ================= FETCH ================= */
  const fetchContacts = async (
    pageParam = page,
    limitParam = limit,
    keywordParam = keyword,
    statusParam = status
  ) => {
    try {
      setLoading(true);

      const res: PaginatedContacts = await ContactService.list({
        page: pageParam,
        limit: limitParam,
        keyword: keywordParam || undefined,
        status: statusParam,
        sort_by: "created_at",
        sort_order: "desc",
      });

      setContacts(res.data);
      setPage(res.page);
      setLimit(res.limit);
      setTotal(res.total);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách liên hệ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(1, limit);
  }, []);

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = async (contact: Contact) => {
    try {
      const newStatus: 0 | 1 = contact.status === 1 ? 0 : 1;
      await ContactService.update(contact.id, { status: newStatus });

      setContacts((prev) =>
        prev.map((c) =>
          c.id === contact.id ? { ...c, status: newStatus } : c
        )
      );

      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  /* ================= DELETE ================= */
  const deleteContact = async (id: number) => {
    try {
      await ContactService.delete(id);
      toast.success("Xóa liên hệ thành công!");

      // nếu xóa item cuối trang → lùi trang
      if (contacts.length === 1 && page > 1) {
        fetchContacts(page - 1, limit);
      } else {
        fetchContacts(page, limit);
      }
    } catch (error) {
      console.error(error);
      toast.error("Xóa liên hệ thất bại!");
    }
  };

  /* ================= COLUMNS ================= */
  const columns: ColumnsType<Contact> = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Họ tên", dataIndex: "fullname" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
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
    {
      title: "Ngày gửi",
      dataIndex: "created_at",
      width: 160,
    },
    {
      title: "Hành động",
      width: 180,
      render: (_: unknown, record: Contact) => (
        <Space>
          <Link href={`/admin/contacts/${record.id}/edit`}>
            <Button type="primary" size="small">
              Trả lời
            </Button>
          </Link>
          <Popconfirm
            title="Xóa liên hệ này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteContact(record.id)}
          >
            <Button danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ================= RENDER ================= */
  return (
    <Card className="p-4 shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Danh sách liên hệ</h1>

      {/* ===== FILTER BAR ===== */}
      <div className="flex gap-3 mb-4">
        <Search
          placeholder="Tìm theo tên, email, SĐT..."
          allowClear
          style={{ width: 260 }}
          onSearch={(value) => {
            setKeyword(value);
            fetchContacts(1, limit, value, status);
          }}
        />

        <Select
          allowClear
          placeholder="Trạng thái"
          style={{ width: 160 }}
          value={status}
          onChange={(value) => {
            setStatus(value);
            fetchContacts(1, limit, keyword, value);
          }}
          options={[
            { label: "Chưa trả lời", value: 0 },
            { label: "Đã trả lời", value: 1 },
          ]}
        />
      </div>

      {/* ===== TABLE ===== */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={contacts}
        loading={loading}
        bordered
        pagination={{
          current: page,
          pageSize: limit,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          onChange: (p, ps) => fetchContacts(p, ps),
          onShowSizeChange: (_, ps) => fetchContacts(1, ps),
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trên ${total} liên hệ`,
        }}
      />
    </Card>
  );
}
