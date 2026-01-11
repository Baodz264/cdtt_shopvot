"use client";

import { useEffect, useState } from "react";
import {
  TrashIcon,
  MapPinIcon,
  CheckCircleIcon,
  PlusIcon,
  XMarkIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

import AddressService, { Address } from "@/services/AddressService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastProvider"; // Đảm bảo đường dẫn này đúng với dự án của bạn

export default function ProfileAddress() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newAddress, setNewAddress] = useState({
    fullname: "",
    phone: "",
    address_line: "",
    city: "",
    district: "",
    ward: "",
    type: "shipping" as "shipping" | "billing",
  });

  /* ================= LẤY DANH SÁCH ĐỊA CHỈ ================= */
  const fetchAddresses = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await AddressService.list({
        user_id: user.id,
        limit: 50,
      });
      setAddresses(res.data);
    } catch (err) {
      error("Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user?.id]);

  /* ================= THÊM ĐỊA CHỈ ================= */
  const handleAddAddress = async () => {
    if (!user?.id) return;
    
    // Kiểm tra sơ bộ form
    if (!newAddress.fullname || !newAddress.phone || !newAddress.address_line) {
      warning("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    try {
      await AddressService.create({
        user_id: user.id,
        ...newAddress,
        is_default: 0,
      });
      
      success("Thêm địa chỉ mới thành công!");
      setShowModal(false);
      setNewAddress({
        fullname: "",
        phone: "",
        address_line: "",
        city: "",
        district: "",
        ward: "",
        type: "shipping",
      });
      fetchAddresses();
    } catch (err) {
      error("Có lỗi xảy ra khi thêm địa chỉ");
    }
  };

  /* ================= XÓA ĐỊA CHỈ ================= */
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await AddressService.delete(id);
      success("Đã xóa địa chỉ");
      fetchAddresses();
    } catch (err) {
      error("Không thể xóa địa chỉ này");
    }
  };

  /* ================= ĐẶT MẶC ĐỊNH ================= */
  const handleSetDefault = async (id: number) => {
    try {
      await AddressService.update(id, { is_default: 1 });
      success("Đã thay đổi địa chỉ mặc định");
      fetchAddresses();
    } catch (err) {
      error("Không thể cập nhật địa chỉ mặc định");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Địa chỉ của tôi</h2>
          <p className="text-gray-500 text-sm mt-1">Quản lý danh sách địa chỉ nhận hàng và thanh toán</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all font-medium shadow-sm active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm địa chỉ mới
        </button>
      </div>

      {/* Danh sách địa chỉ dạng Card */}
      <div className="grid grid-cols-1 gap-4">
        {addresses.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-gray-50">
            <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới!</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative border-2 rounded-2xl p-5 transition-all bg-white hover:border-blue-200 ${
                addr.is_default === 1 ? "border-blue-500 shadow-md" : "border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${addr.is_default === 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-lg">{addr.fullname}</span>
                      {addr.is_default === 1 && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <CheckBadgeIcon className="w-3 h-3" /> Mặc định
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-0.5">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {addr.is_default !== 1 && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Đặt làm mặc định"
                    >
                      <CheckCircleIcon className="w-6 h-6" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Xóa địa chỉ"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="ml-12">
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {addr.address_line}, {addr.ward}, {addr.district}, {addr.city}
                </p>
                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-md uppercase tracking-tight">
                  {addr.type === "shipping" ? "📦 Giao hàng" : "💳 Thanh toán"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Thêm địa chỉ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Thêm địa chỉ nhận hàng</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Họ và tên</label>
                  <input
                    type="text"
                    value={newAddress.fullname}
                    onChange={(e) => setNewAddress({ ...newAddress, fullname: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Nhập họ tên người nhận"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={newAddress.address_line}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Số nhà, tên đường..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Tỉnh / Thành</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="VD: Hà Nội"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Quận / Huyện</label>
                  <input
                    type="text"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="VD: Cầu Giấy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Phường / Xã</label>
                  <input
                    type="text"
                    value={newAddress.ward}
                    onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="VD: Dịch Vọng"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Loại địa chỉ</label>
                <select
                  value={newAddress.type}
                  // FIX ERROR HERE: Ép kiểu thay vì dùng 'any'
                  onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as "shipping" | "billing" })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="shipping">Địa chỉ giao hàng</option>
                  <option value="billing">Địa chỉ thanh toán</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-white transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleAddAddress}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
              >
                Lưu địa chỉ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}