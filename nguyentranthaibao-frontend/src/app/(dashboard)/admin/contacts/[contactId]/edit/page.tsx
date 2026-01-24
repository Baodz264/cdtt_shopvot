"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Spin,
  Typography,
  Divider,
} from "antd";

import ContactService, { Contact } from "@/services/ContactService";
import { useToast } from "@/context/ToastProvider";

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const contactId = Number(params.contactId);

  const [form] = Form.useForm();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  /* ================= LOAD CONTACT ================= */
  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const data = await ContactService.get(contactId);
        setContact(data);
        
        // Cập nhật giá trị vào form sau khi lấy được data
        form.setFieldsValue({
          reply: data.reply ?? "",
          status: data.status ?? 0,
        });
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Không thể tải liên hệ!");
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(contactId)) {
      fetchContact();
    }
  }, [contactId, form, toast]);

  /* ================= SUBMIT ================= */
  const onFinish = async (values: { reply: string; status: 0 | 1 }) => {
    if (!contact) return;

    try {
      setSaving(true);
      await ContactService.update(contact.id, {
        reply: values.reply,
        status: values.status,
      });

      toast.success("Cập nhật liên hệ thành công!");
      router.push("/admin/contacts");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Lỗi khi cập nhật liên hệ!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Title level={3}>Trả lời liên hệ {contactId ? `#${contactId}` : ""}</Title>

      {/* Sửa lỗi Spin: Bọc Spin bên ngoài nội dung hoặc bỏ tip nếu đứng một mình */}
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        {!loading && !contact ? (
          <Card className="text-center py-10">
            <Text type="danger">Không tìm thấy liên hệ hoặc có lỗi xảy ra.</Text>
            <div className="mt-4">
              <Button onClick={() => router.push("/admin/contacts")}>
                Quay lại danh sách
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ minHeight: '200px' }}>
            {/* ===== THÔNG TIN LIÊN HỆ ===== */}
            <Card className="mb-6 shadow-sm" loading={loading}>
              {contact && (
                <>
                  <p><Text strong>Họ tên:</Text> {contact.fullname}</p>
                  <p><Text strong>Email:</Text> {contact.email || "—"}</p>
                  <p><Text strong>SĐT:</Text> {contact.phone || "—"}</p>
                  <Divider />
                  <Text strong>Nội dung:</Text>
                  <div className="mt-2 p-3 bg-gray-50 border rounded text-gray-700">
                    {contact.message}
                  </div>
                </>
              )}
            </Card>

            {/* ===== FORM TRẢ LỜI ===== */}
            <Card className="shadow-sm">
              <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                // Khởi tạo giá trị ban đầu để tránh lỗi đồng bộ
                initialValues={{
                  reply: "",
                  status: 0,
                }}
              >
                <Form.Item
                  label="Trả lời"
                  name="reply"
                  rules={[{ required: true, message: "Vui lòng nhập nội dung trả lời!" }]}
                >
                  <TextArea rows={6} placeholder="Nhập nội dung phản hồi..." />
                </Form.Item>

                <Form.Item
                  label="Trạng thái"
                  name="status"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Select.Option value={0}>Chưa trả lời</Select.Option>
                    <Select.Option value={1}>Đã trả lời</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item className="mb-0">
                  <div className="flex gap-3">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={saving}
                      disabled={loading}
                    >
                      Lưu cập nhật
                    </Button>
                    <Button
                      onClick={() => router.push("/admin/contacts")}
                    >
                      Hủy bỏ
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </Card>
          </div>
        )}
      </Spin>
    </div>
  );
}