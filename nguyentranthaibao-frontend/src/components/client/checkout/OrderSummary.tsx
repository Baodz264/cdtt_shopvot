import { Card, Flex, Avatar, Tag, Typography, Divider, Button } from "antd";
import { ExtendedCartItem } from "@/types/cart";

const { Title, Text } = Typography;
const IMAGE_BASE = "http://localhost:8000";

interface Props {
  items: ExtendedCartItem[];
  totalPrice: number;
  shippingFee: number;
  discountAmount: number;
  finalTotal: number;
  loading: boolean;
  onPayment: () => void;
}

export const OrderSummary = ({ items, totalPrice, shippingFee, discountAmount, finalTotal, loading, onPayment }: Props) => (
  <div style={{ position: 'sticky', top: 24 }}>
    <Card title="Tóm tắt đơn hàng">
      <Flex vertical gap="middle" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: 16 }}>
        {items.map((item) => (
          <Flex key={item.id} justify="space-between" align="center" gap="middle">
            <Flex gap="small" align="center">
              <Avatar 
                shape="square" size={64} 
                src={item.variant_value?.thumbnail ? `${IMAGE_BASE}${item.variant_value.thumbnail}` : (item.product?.thumbnail ? `${IMAGE_BASE}${item.product.thumbnail}` : "/images/default.png")} 
              />
              <Flex vertical>
                <Text strong style={{ maxWidth: 150 }} ellipsis>{item.product?.name}</Text>
                {item.variant_value && <Tag color="blue" style={{ width: 'fit-content' }}>{item.variant_value.value}</Tag>}
                <Text type="secondary">x{item.quantity}</Text>
              </Flex>
            </Flex>
            <Text strong>{(item.price * item.quantity).toLocaleString()}đ</Text>
          </Flex>
        ))}
      </Flex>

      <Divider />
      
      <Flex vertical gap="small">
        <Flex justify="space-between"><Text>Tạm tính:</Text><Text strong>{totalPrice.toLocaleString()}đ</Text></Flex>
        <Flex justify="space-between"><Text>Phí vận chuyển:</Text><Text strong>{shippingFee.toLocaleString()}đ</Text></Flex>
        {discountAmount > 0 && (
          <Flex justify="space-between"><Text>Giảm giá:</Text><Text strong type="danger">-{discountAmount.toLocaleString()}đ</Text></Flex>
        )}
      </Flex>

      <Divider />
      
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Tổng cộng:</Title>
        <Title level={4} type="danger" style={{ margin: 0 }}>{finalTotal.toLocaleString()}đ</Title>
      </Flex>

      <Button 
        type="primary" size="large" block danger 
        loading={loading} onClick={onPayment}
        style={{ height: 48, fontWeight: 'bold' }}
      >
        ĐẶT HÀNG NGAY
      </Button>
    </Card>
  </div>
);