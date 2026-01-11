"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Spin,
  message,
  Select,
  DatePicker,
  Space,
  Divider,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Bar, Line } from "react-chartjs-2";

import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

import OrderService, { Order } from "@/services/OrderService";
import PaymentService, { Payment } from "@/services/PaymentService";
import UserService, { User } from "@/services/UserService";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const { RangePicker } = DatePicker;

type FilterType = "week" | "month" | "year" | "range";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<FilterType>("month");

  // ✅ FIX TYPE RANGE
  const [range, setRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [newUsers, setNewUsers] = useState(0);

  const [labels, setLabels] = useState<string[]>([]);
  const [revenueByTime, setRevenueByTime] = useState<number[]>([]);
  const [ordersByTime, setOrdersByTime] = useState<number[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, [filterType, range]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const ordersRes = await OrderService.list({ limit: 1000 });
      const orders: Order[] = ordersRes.data;

      const paymentsRes = await PaymentService.list({ limit: 1000 });
      const payments: Payment[] = paymentsRes.data.data.filter(
        (p) => p.payment_status === "paid"
      );

      const usersRes = await UserService.list({ limit: 1000 });
      const users: User[] = usersRes.data;

      /* ===== TIME RANGE ===== */
      let start: Dayjs;
      let end: Dayjs;

      switch (filterType) {
        case "week":
          start = dayjs().startOf("week");
          end = dayjs().endOf("week");
          break;

        case "month":
          start = dayjs().startOf("month");
          end = dayjs().endOf("month");
          break;

        case "year":
          start = dayjs().startOf("year");
          end = dayjs().endOf("year");
          break;

        case "range":
          if (!range || !range[0] || !range[1]) return;
          start = range[0];
          end = range[1];
          break;

        default:
          start = dayjs().startOf("month");
          end = dayjs().endOf("month");
      }

      /* ===== FILTER DATA ===== */
      const filteredPayments = payments.filter(
        (p) =>
          p.created_at &&
          dayjs(p.created_at).isBetween(start, end, "day", "[]")
      );

      const filteredOrders = orders.filter(
        (o) =>
          o.created_at &&
          dayjs(o.created_at).isBetween(start, end, "day", "[]")
      );

      const filteredUsers = users.filter(
        (u) =>
          u.created_at &&
          dayjs(u.created_at).isBetween(start, end, "day", "[]")
      );

      setTotalRevenue(
        filteredPayments.reduce((s, p) => s + p.amount, 0)
      );
      setTotalOrders(filteredOrders.length);
      setNewUsers(filteredUsers.length);

      /* ===== CHART DATA ===== */
      const days = end.diff(start, "day") + 1;

      const chartLabels: string[] = [];
      const revenueData: number[] = [];
      const orderData: number[] = [];

      for (let i = 0; i < days; i++) {
        const d = start.add(i, "day");

        chartLabels.push(d.format("DD/MM"));

        revenueData.push(
          filteredPayments
            .filter(
              (p) =>
                p.created_at &&
                dayjs(p.created_at).isSame(d, "day")
            )
            .reduce((s, p) => s + p.amount, 0)
        );

        orderData.push(
          filteredOrders.filter(
            (o) =>
              o.created_at &&
              dayjs(o.created_at).isSame(d, "day")
          ).length
        );
      }

      setLabels(chartLabels);
      setRevenueByTime(revenueData);
      setOrdersByTime(orderData);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải dashboard");
    } finally {
      setLoading(false);
    }
  };

  /* ===== CHART CONFIG ===== */
  const revenueChart = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: revenueByTime,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,.3)",
          tension: 0.4,
        },
      ],
    }),
    [labels, revenueByTime]
  );

  const orderChart = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Đơn hàng",
          data: ordersByTime,
          backgroundColor: "rgba(16,185,129,.6)",
        },
      ],
    }),
    [labels, ordersByTime]
  );

  if (loading) return <Spin size="large" />;

  return (
    <div className="p-6 space-y-6">
      <Row justify="space-between" align="middle">
        <h1 className="text-3xl font-semibold">Dashboard</h1>

        <Space>
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 150 }}
            options={[
              { label: "Theo tuần", value: "week" },
              { label: "Theo tháng", value: "month" },
              { label: "Theo năm", value: "year" },
              { label: "Tùy chọn", value: "range" },
            ]}
          />
          {filterType === "range" && (
            <RangePicker
              value={range}
              onChange={(values) => setRange(values)}
            />
          )}
        </Space>
      </Row>

      <Divider />

      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Đơn hàng"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Người dùng mới"
              value={newUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Card title="Doanh thu">
            <Line data={revenueChart} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Đơn hàng">
            <Bar data={orderChart} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
