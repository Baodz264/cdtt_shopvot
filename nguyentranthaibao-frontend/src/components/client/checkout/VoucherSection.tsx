"use client";

import { Card, Button, Tag, Flex, Typography } from "antd";
import { ClockCircleOutlined, CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Voucher } from "@/types/types";

const { Text } = Typography;

interface Props {
  vouchers: Voucher[];
  orderTotal: number;
  onSelect: (voucher: Voucher, discountAmount: number) => void;
}

export default function VoucherList({ vouchers, orderTotal, onSelect }: Props) {
  const calcDiscount = (voucher: Voucher) => {
    if (voucher.type === "percent") {
      const raw = (orderTotal * voucher.discount_value) / 100;
      return voucher.max_discount
        ? Math.min(raw, voucher.max_discount)
        : raw;
    }
    return voucher.discount_value;
  };

  return (
    <Card title="🎁 Voucher của bạn">
      <Flex vertical gap="small">
        {vouchers.map((voucher) => {
          const discount = calcDiscount(voucher);
          const disabled = !!(voucher.min_order && orderTotal < voucher.min_order);

          return (
            <Card
              key={voucher.id}
              size="small"
              style={{ opacity: disabled ? 0.5 : 1 }}
            >
              <Flex justify="space-between" align="center">
                <div>
                  <Tag color="blue">{voucher.code}</Tag>
                  <div>
                    <Text strong>
                      Giảm{" "}
                      {voucher.type === "percent"
                        ? `${voucher.discount_value}%`
                        : `${voucher.discount_value.toLocaleString()}đ`}
                    </Text>
                  </div>

                  {voucher.min_order && (
                    <Text type="secondary">
                      Đơn tối thiểu {voucher.min_order.toLocaleString()}đ
                    </Text>
                  )}

                  {voucher.end_date && (
                    <div>
                      <ClockCircleOutlined /> HSD:{" "}
                      {dayjs(voucher.end_date).format("DD/MM/YYYY")}
                    </div>
                  )}
                </div>

                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  disabled={disabled}
                  onClick={() => onSelect(voucher, discount)}
                >
                  Dùng
                </Button>
              </Flex>
            </Card>
          );
        })}

        {vouchers.length === 0 && (
          <Text type="secondary">Bạn chưa có voucher nào</Text>
        )}
      </Flex>
    </Card>
  );
}
