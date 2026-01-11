"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ContactService, { Contact } from "@/services/ContactService";
import { useToast } from "@/context/ToastProvider";

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = Number(params.contactId);

  const toast = useToast(); // <-- sử dụng toast

  const [contact, setContact] = useState<Contact | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  // ----------------- LOAD CONTACT -----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ContactService.get(contactId);

        setContact({
          ...data,
          email: data.email ?? "",
          phone: data.phone ?? "",
          reply: data.reply ?? "",
          status: data.status ?? 0,
        });

        setReply(data.reply ?? "");
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải liên hệ!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [contactId, toast]);

  // ----------------- SUBMIT UPDATE -----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    try {
      await ContactService.update(contact.id, {
        reply: reply,
        status: contact.status as 0 | 1,
      });

      toast.success("Cập nhật liên hệ thành công!");
      router.push("/admin/contacts");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật liên hệ!");
    }
  };

  if (loading) return <div className="p-6 text-lg">Đang tải...</div>;
  if (!contact) return <div className="p-6 text-lg">Không tìm thấy liên hệ.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Trả lời liên hệ #{contact.id}</h1>

      <div className="bg-white shadow rounded p-4 space-y-2">
        <p><strong>Họ tên:</strong> {contact.fullname}</p>
        <p><strong>Email:</strong> {contact.email}</p>
        <p><strong>SĐT:</strong> {contact.phone}</p>
        <p><strong>Nội dung:</strong></p>
        <div className="bg-gray-50 border p-3 rounded">{contact.message}</div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 space-y-4">
        <div>
          <label className="font-semibold mb-2 block">Trả lời</label>
          <textarea
            rows={6}
            className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-400"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold mb-2 block">Trạng thái</label>
          <select
            className="w-full border p-3 rounded"
            value={contact.status}
            onChange={(e) =>
              setContact({ ...contact, status: Number(e.target.value) as 0 | 1 })
            }
          >
            <option value={0}>Chưa trả lời</option>
            <option value={1}>Đã trả lời</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
            Lưu
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/contacts")}
            className="bg-gray-300 px-6 py-2 rounded"
          >
            Quay lại
          </button>
        </div>
      </form>
    </div>
  );
}
