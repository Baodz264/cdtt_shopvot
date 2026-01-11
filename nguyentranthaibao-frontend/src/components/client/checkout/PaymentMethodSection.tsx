import { Card, Radio, Row, Col, Flex } from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import { PAYMENT_METHODS } from "@/types/types";
import { PaymentMethod } from "@/services/OrderService";

interface Props {
  value: PaymentMethod;
  onChange: (val: PaymentMethod) => void;
}

export const PaymentMethodSection = ({ value, onChange }: Props) => (
  <Card title={<span><CreditCardOutlined style={{ marginRight: 8 }} />Phương thức thanh toán</span>}>
    <Radio.Group onChange={(e) => onChange(e.target.value)} value={value} className="w-full">
      <Row gutter={[16, 16]}>
        {PAYMENT_METHODS.map((m) => (
          <Col xs={24} md={12} key={m.value}>
            <Radio value={m.value} className="w-full border p-3 rounded" style={{ margin: 0 }}>
              <Flex align="center" gap="small" component="span">
                <img src={m.image} alt={m.label} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                {m.label}
              </Flex>
            </Radio>
          </Col>
        ))}
      </Row>
    </Radio.Group>
  </Card>
);