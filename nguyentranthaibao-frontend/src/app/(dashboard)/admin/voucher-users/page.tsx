"use client";

import { useState, useEffect, useMemo } from "react";
import { Table, Tag, Tooltip, message, Input } from "antd";

import { VoucherUserService } from "@/services/VoucherUserService";
import UserService, { User as ApiUser } from "@/services/UserService";
import { VoucherService } from "@/services/VoucherService";

/* =======================
   Interfaces
======================= */
interface Voucher {
  id: number;
  code: string;
  name: string;
}

interface VoucherUser {
  id: number;
  voucher_id: number;
  user_id: number;
  order_id: number | null;
  used_at?: string;
  voucher?: Voucher;
  user?: ApiUser;
}

/* =======================
   Component
======================= */
export default function VoucherUserPage() {
  const [voucherUsers, setVoucherUsers] = useState<VoucherUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  /* =======================
     Fetch + call thêm API
  ======================= */
  const fetchVoucherUsers = async (page = 1, limit = 5) => {
    setLoading(true);
    try {
      const res = await VoucherUserService.list({ page, limit });
      const rawData: VoucherUser[] = res.data ?? [];

      const userIds = [...new Set(rawData.map(i => i.user_id))];
      const voucherIds = [...new Set(rawData.map(i => i.voucher_id))];

      const [users, vouchers] = await Promise.all([
        Promise.all(userIds.map(id => UserService.detail(id))),
        Promise.all(voucherIds.map(id => VoucherService.detail(id))),
      ]);

      const userMap = new Map<number, ApiUser>();
      users.forEach(u => u.id && userMap.set(u.id, u));

      const voucherMap = new Map<number, Voucher>();
      vouchers.forEach(v => v?.id && voucherMap.set(v.id, v));

      const mergedData: VoucherUser[] = rawData.map(item => ({
        ...item,
        user: userMap.get(item.user_id),
        voucher: voucherMap.get(item.voucher_id),
      }));

      setVoucherUsers(mergedData);
      setPagination(prev => ({
        ...prev,
        total: res.total ?? 0,
        current: page,
      }));
    } catch (err) {
      console.error(err);
      message.error("Lấy danh sách voucher người dùng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucherUsers(pagination.current, pagination.pageSize);
  }, []);

  /* =======================
     Search filter (frontend)
  ======================= */
  const filteredData = useMemo(() => {
    if (!search) return voucherUsers;

    const keyword = search.toLowerCase();

    return voucherUsers.filter(item =>
      item.voucher?.name?.toLowerCase().includes(keyword) ||
      item.voucher?.code?.toLowerCase().includes(keyword) ||
      item.user?.name?.toLowerCase().includes(keyword) ||
      item.user?.email?.toLowerCase().includes(keyword)
    );
  }, [voucherUsers, search]);

  /* =======================
     Columns
  ======================= */
  const columns = [
    {
      title: "Voucher",
      dataIndex: "voucher",
      key: "voucher",
      render: (voucher?: Voucher) => (
        <span>
          <strong>{voucher?.name ?? "-"}</strong>
          {voucher?.code ? ` (${voucher.code})` : ""}
        </span>
      ),
    },
    {
      title: "Người dùng",
      dataIndex: "user",
      key: "user",
      render: (user?: ApiUser) => (
        <div>
          <span>{user?.name ?? "-"}</span>
          <br />
          {user?.email && (
            <Tooltip title={user.email}>
              <small className="text-gray-500 truncate block max-w-xs">
                {user.email}
              </small>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Order",
      dataIndex: "order_id",
      key: "order_id",
      render: (order_id: number | null) =>
        order_id ? `#${order_id}` : "Chưa dùng",
    },
    {
      title: "Trạng thái",
      dataIndex: "used_at",
      key: "status",
      render: (used_at?: string) =>
        used_at ? (
          <Tag color="green">Đã dùng</Tag>
        ) : (
          <Tag color="volcano">Chưa dùng</Tag>
        ),
    },
    {
      title: "Claimed At",
      dataIndex: "used_at",
      key: "used_at_time",
      render: (used_at?: string) => used_at ?? "-",
    },
  ];

  /* =======================
     Render
  ======================= */
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Voucher người dùng</h1>

      {/* SEARCH */}
      <Input.Search
        placeholder="Tìm voucher / user / email..."
        allowClear
        onChange={e => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            onChange: (page, pageSize) =>
              fetchVoucherUsers(page, pageSize),
          }}
          bordered
          size="middle"
        />
      </div>
    </div>
  );
}
