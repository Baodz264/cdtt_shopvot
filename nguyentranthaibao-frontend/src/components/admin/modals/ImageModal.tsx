"use client";

import { Modal, Form, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { FormInstance } from "antd";
import { useEffect } from "react";
import React from "react";

interface EditingImage {
  id: number;
  caption: string;
  url: string;
}

interface ImageModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  form: FormInstance;
  editingImage?: EditingImage;
  uploadFileList: UploadFile[];
  setUploadFileList: React.Dispatch<
    React.SetStateAction<UploadFile[]>
  >;
}

export default function ImageModal({
  open,
  onCancel,
  onSubmit,
  form,
  editingImage,
  uploadFileList,
  setUploadFileList,
}: ImageModalProps) {
  useEffect(() => {
    if (!open) return;

    // Sửa ảnh → chỉ 1 file
    if (editingImage) {
      form.setFieldsValue({ caption: editingImage.caption });
      setUploadFileList([
        {
          uid: editingImage.id.toString(),
          name: "image.jpg",
          status: "done",
          url: editingImage.url,
        },
      ]);
    }
    // Thêm ảnh → reset
    else {
      form.resetFields();
      setUploadFileList([]);
    }
  }, [open, editingImage, form, setUploadFileList]);

  return (
    <Modal
      title={editingImage ? "Sửa ảnh" : "Thêm ảnh (chọn nhiều)"}
      open={open}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setUploadFileList([]);
      }}
      onOk={onSubmit}
      okText="Lưu"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="caption" label="Chú thích">
          <Input />
        </Form.Item>

        <Form.Item
          label="Ảnh"
          required={!editingImage && uploadFileList.length === 0}
          help={!editingImage ? "Có thể chọn nhiều ảnh cùng lúc" : undefined}
        >
          <Upload
            accept="image/*"
            listType="picture"
            multiple={!editingImage}
            fileList={uploadFileList}
            beforeUpload={(file) => {
              setUploadFileList((prev: UploadFile[]) => [
                ...prev,
                {
                  uid: file.uid,
                  name: file.name,
                  status: "done",
                  originFileObj: file,
                },
              ]);
              return false;
            }}
            onRemove={(file) => {
              setUploadFileList((prev: UploadFile[]) =>
                prev.filter((f) => f.uid !== file.uid)
              );
            }}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
