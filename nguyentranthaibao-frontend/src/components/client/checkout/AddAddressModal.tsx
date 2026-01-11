import { Modal, Form, Row, Col, Input, Checkbox, FormInstance } from "antd";
import { Address } from "@/services/AddressService";

interface Props {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: Partial<Address>) => void;
  form: FormInstance;
  hasAddress?: boolean; // 👈 đã có địa chỉ chưa
}

export const AddAddressModal = ({
  open,
  onCancel,
  onFinish,
  form,
  hasAddress = false,
}: Props) => (
  <Modal
    title="Thêm địa chỉ mới"
    open={open}
    onCancel={onCancel}
    onOk={() => form.submit()}
    okText="Lưu địa chỉ"
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        is_default: !hasAddress, // 🔥 nếu là địa chỉ đầu tiên → mặc định
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="fullname"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input placeholder="09xxxxxxx" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="address_line"
        label="Địa chỉ cụ thể"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
      >
        <Input placeholder="Số nhà, tên đường..." />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="city" label="Tỉnh/TP" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      {/* 🔥 CÁI QUAN TRỌNG */}
      <Form.Item name="is_default" valuePropName="checked">
        <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
      </Form.Item>
    </Form>
  </Modal>
);
