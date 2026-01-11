"use client";

import { Card, Button, Radio, Flex, Typography, Empty, Space } from "antd";
import { EnvironmentOutlined, PlusOutlined } from "@ant-design/icons";
import { Address } from "@/services/AddressService";

const { Text } = Typography;

interface Props {
  addresses: Address[];
  selectedId: number | null;
  onChange: (id: number) => void;
  onAddNew: () => void;
}

export const AddressSection = ({ addresses, selectedId, onChange, onAddNew }: Props) => (
  <Card 
    title={
      <Space>
        <EnvironmentOutlined />
        <span>Địa chỉ nhận hàng</span>
      </Space>
    }
    extra={<Button type="link" icon={<PlusOutlined />} onClick={onAddNew}>Thêm địa chỉ mới</Button>}
  >
    {addresses.length === 0 ? (
      <Empty description="Bạn chưa có địa chỉ nhận hàng nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    ) : (
      <Radio.Group 
        className="w-full" 
        value={selectedId} 
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%' }}
      >
        <Flex vertical gap="middle">
          {addresses.map((addr) => (
            <Radio.Button 
              key={addr.id} 
              value={addr.id} 
              style={{ 
                display: 'block', 
                height: 'auto', 
                padding: '16px', 
                borderRadius: '8px',
                lineHeight: '1.5'
              }}
            >
              <Flex justify="space-between" align="center">
                <Text strong>{addr.fullname}</Text>
                <Text type="secondary">{addr.phone}</Text>
              </Flex>
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '13px', 
                  display: 'block', 
                  marginTop: 6, 
                  whiteSpace: 'normal', // Quan trọng: Để text xuống dòng thay vì bị ẩn
                  textAlign: 'left' 
                }}
              >
                {`${addr.address_line}, ${addr.ward}, ${addr.district}, ${addr.city}`}
              </Text>
            </Radio.Button>
          ))}
        </Flex>
      </Radio.Group>
    )}
  </Card>
);