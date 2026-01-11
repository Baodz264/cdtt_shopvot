"use client";

import { Modal, Form, Input, InputNumber, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import type { FormInstance } from "antd";
import { useEffect } from "react";

const IMAGE_BASE = "http://localhost:8000";

interface VariantValue { id: number; value: string; extra_price?: number; stock?: number; thumbnail?: string }
interface VariantValueModalProps { open: boolean; onCancel: () => void; onSubmit: () => void; form: FormInstance; editingValue?: VariantValue; uploadFileList: UploadFile[]; setUploadFileList: (files: UploadFile[]) => void }

export default function VariantValueModal({ open, onCancel, onSubmit, form, editingValue, uploadFileList, setUploadFileList }: VariantValueModalProps) {
  useEffect(() => {
    if (!open) return;
    if (editingValue) {
      form.setFieldsValue({ value: editingValue.value, extra_price: editingValue.extra_price ?? null, stock: editingValue.stock ?? null });
      setUploadFileList(editingValue.thumbnail ? [{ uid: "-1", name: "image.jpg", status: "done", url: `${IMAGE_BASE}${editingValue.thumbnail}` }] : []);
    } else { form.resetFields(); setUploadFileList([]); }
  }, [open, editingValue, form, setUploadFileList]);

  const handleBeforeUpload = (file: RcFile) => { setUploadFileList([{ uid: file.uid, name: file.name, status: "done", originFileObj: file, url: URL.createObjectURL(file) }]); return false; };
  const handleRemove = () => setUploadFileList([]);

  return (
    <Modal title={editingValue ? "Sửa giá trị" : "Thêm giá trị"} open={open} onCancel={() => { onCancel(); form.resetFields(); setUploadFileList([]); }} onOk={onSubmit} okText="Lưu">
      <Form form={form} layout="vertical" preserve={true}>
        <Form.Item name="value" label="Giá trị" rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}><Input /></Form.Item>
        <Form.Item name="extra_price" label="Giá + thêm"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
        <Form.Item name="stock" label="Kho"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Ảnh">
          <Upload accept="image/*" listType="picture-card" fileList={uploadFileList} beforeUpload={handleBeforeUpload} onRemove={handleRemove} maxCount={1}>
            {uploadFileList.length < 1 && <div><UploadOutlined /><div style={{ marginTop: 8 }}>Chọn ảnh</div></div>}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
