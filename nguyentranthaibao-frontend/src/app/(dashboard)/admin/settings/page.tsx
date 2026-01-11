"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

import SettingService, { Setting } from "@/services/SettingService";
import { useToast } from "@/context/ToastProvider"; // <-- import toast

const IMAGE_BASE = "http://localhost:8000";

export default function SettingPage() {
  const toast = useToast(); // <-- dùng toast
  const [data, setData] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Setting | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [form] = Form.useForm<Setting>();

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await SettingService.list({ page: 1, limit: 10 });
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được dữ liệu setting");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= OPEN MODAL (ADD / EDIT) =================
  const openModal = (record?: Setting) => {
    setEditing(record ?? null);

    if (record) {
      form.setFieldsValue(record);
      setFileList(
        record.logo
          ? [
              {
                uid: "-1",
                name: "logo",
                status: "done",
                url: IMAGE_BASE + record.logo,
              },
            ]
          : []
      );
    } else {
      form.resetFields();
      setFileList([]);
    }

    setOpen(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id?: number) => {
    if (!id) return;

    try {
      await SettingService.delete(id);
      toast.success("Đã xóa setting");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại");
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (typeof value === "string") {
          formData.append(key, value);
        } else if (typeof value === "number") {
          formData.append(key, value.toString());
        }
      });

      if (fileList[0]?.originFileObj) {
        formData.append("logo", fileList[0].originFileObj);
      }

      if (editing?.id) {
        await SettingService.update(editing.id, formData);
        toast.success("Cập nhật setting thành công");
      } else {
        await SettingService.create(formData);
        toast.success("Thêm setting thành công");
      }

      setOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Lưu dữ liệu thất bại");
    }
  };

  // ================= TABLE =================
  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Thêm setting
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          { title: "Tên", dataIndex: "name" },
          { title: "Email", dataIndex: "email" },
          { title: "Phone", dataIndex: "phone" },
          { title: "Hotline", dataIndex: "hotline" },
          { title: "Địa chỉ", dataIndex: "address" },
          {
            title: "Logo",
            dataIndex: "logo",
            render: (logo?: string) =>
              logo ? <img src={IMAGE_BASE + logo} alt="logo" width={50} /> : "-",
          },
          {
            title: "Hành động",
            render: (_, record) => (
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => openModal(record)}
                />
                <Popconfirm
                  title="Xóa setting này?"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      {/* ================= MODAL ================= */}
      <Modal
        open={open}
        title={editing ? "Cập nhật setting" : "Thêm setting"}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="hotline" label="Hotline">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item label="Logo">
            <Upload
              listType="picture"
              beforeUpload={() => false}
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
