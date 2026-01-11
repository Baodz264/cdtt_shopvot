"use client";

import { Modal, Form, Input, FormInstance } from "antd";

interface Variant { id: number; name: string; sku?: string }
interface VariantModalProps { open: boolean; onCancel: () => void; onSubmit: () => void; form: FormInstance; editingVariant?: Variant }

export default function VariantModal({ open, onCancel, onSubmit, form, editingVariant }: VariantModalProps) {
  return (
    <Modal title={editingVariant ? "Sửa biến thể" : "Thêm biến thể"} open={open} onCancel={onCancel} onOk={onSubmit} okText="Lưu">
      <Form form={form} layout="vertical" preserve={true}>
        <Form.Item name="name" label="Tên biến thể" rules={[{ required: true, message: "Vui lòng nhập tên" }]}><Input /></Form.Item>
        <Form.Item name="sku" label="SKU"><Input /></Form.Item>
      </Form>
    </Modal>
  );
}
