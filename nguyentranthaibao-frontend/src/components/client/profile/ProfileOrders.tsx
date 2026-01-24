"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link"; // Import Link để điều hướng
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastProvider";
import OrderService, { Order } from "@/services/OrderService";
import OrderItemService, { OrderItem } from "@/services/OrderItemService";
import ProductService from "@/services/ProductService";
import { 
  RefreshCw, 
  ShoppingBag, 
  XCircle, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight 
} from "lucide-react";

/* ================= TYPES ================= */
interface ProductDetail {
  id: number;
  name: string;
  slug?: string; // Thêm slug để giống ProductCard
  thumbnail: string;
  price: number;
}

interface VariantDetail {
  id: number;
  value: string;
}

interface OrderItemExtended extends OrderItem {
  productDetail?: ProductDetail | null;
  variantDetail?: VariantDetail | null;
}

interface AuthUser {
  id: number;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

const IMAGE_BASE = "http://localhost:8000";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xử lý" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn tất" },
  { id: "cancelled", label: "Đã hủy" },
];

export default function ProfileOrders() {
  const { user, loading: authLoading } = useAuth() as AuthContextType;
  const toast = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [orderItemsMap, setOrderItemsMap] = useState<{ [key: number]: OrderItemExtended[] }>({});

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await OrderService.list({ user_id: user.id, limit: 20 });
      const ordersData = response.data;
      setOrders(ordersData);

      const productCache: { [key: number]: ProductDetail } = {};
      const newItemsMap: { [key: number]: OrderItemExtended[] } = {};

      await Promise.all(
        ordersData.map(async (order) => {
          const itemsRes = await OrderItemService.list({ order_id: order.id });
          const extendedItems = await Promise.all(
            itemsRes.data.map(async (item: OrderItem) => {
              const extItem: OrderItemExtended = { ...item };
              if (productCache[item.product_id]) {
                extItem.productDetail = productCache[item.product_id];
              } else {
                try {
                  const prodRes = await ProductService.get(item.product_id);
                  extItem.productDetail = prodRes.data;
                  productCache[item.product_id] = prodRes.data;
                } catch { 
                  extItem.productDetail = null; 
                }
              }
              return extItem;
            })
          );
          newItemsMap[order.id] = extendedItems;
        })
      );
      setOrderItemsMap(newItemsMap);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) fetchOrders();
  }, [authLoading, fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((o) => o.status.toLowerCase() === activeTab);
  }, [orders, activeTab]);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      await OrderService.update(orderId, { status: "cancelled", payment_status: "unpaid" });
      toast.success("Hủy đơn hàng thành công");
      fetchOrders();
    } catch (error) {
      toast.error("Hủy đơn hàng thất bại");
    }
  };

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "completed": return { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: <CheckCircle2 size={14} />, text: "Hoàn tất" };
      case "pending": return { color: "text-amber-600 bg-amber-50 border-amber-100", icon: <Clock size={14} />, text: "Chờ xử lý" };
      case "cancelled": return { color: "text-rose-600 bg-rose-50 border-rose-100", icon: <AlertCircle size={14} />, text: "Đã hủy" };
      case "shipping": return { color: "text-blue-600 bg-blue-50 border-blue-100", icon: <Package size={14} />, text: "Đang giao" };
      default: return { color: "text-slate-600 bg-slate-50 border-slate-100", icon: <Package size={14} />, text: status };
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lịch sử đơn hàng</h1>
          <p className="text-slate-500 text-sm">Theo dõi trạng thái và chi tiết các giao dịch của bạn</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold shadow-sm active:scale-95"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Làm mới dữ liệu
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? "bg-white text-indigo-600 shadow-md ring-1 ring-black/5" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag size={36} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không tìm thấy đơn hàng</h3>
          <p className="text-slate-500 mt-1 max-w-[250px] text-center text-sm">
            Có vẻ như bạn chưa có đơn hàng nào trong mục này.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const status = getStatusConfig(order.status);
            return (
              <div key={order.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300">
                
                {/* Order Top Bar */}
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-indigo-600">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã đơn hàng</p>
                      <p className="text-sm font-bold text-slate-900">#{order.id}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm ${status.color}`}>
                    {status.icon}
                    {status.text}
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-slate-50">
                  {orderItemsMap[order.id]?.map((item) => (
                    <div key={item.id} className="p-6 flex items-center gap-5 group/item">
                      <div className="relative shrink-0">
                        {/* Bọc ảnh trong Link tới sản phẩm */}
                        <Link href={`/products/${item.productDetail?.slug || item.product_id}`}>
                          <img
                            src={item.productDetail?.thumbnail ? `${IMAGE_BASE}${item.productDetail.thumbnail}` : "/images/placeholder.png"}
                            alt={item.productDetail?.name}
                            className="w-20 h-20 object-cover rounded-2xl bg-slate-100 ring-1 ring-slate-200 group-hover/item:ring-indigo-300 transition-all cursor-pointer"
                          />
                        </Link>
                        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full ring-4 ring-white shadow-lg">
                          {item.quantity}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.productDetail?.slug || item.product_id}`}>
                          <h4 className="font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate cursor-pointer">
                            {item.productDetail?.name}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
                            {item.variantDetail?.value ?? "Tiêu chuẩn"}
                          </span>
                          <span className="text-xs text-slate-400">Đơn giá: {item.price.toLocaleString()}đ</span>
                        </div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <p className="font-black text-slate-900">{(item.price * item.quantity).toLocaleString()}đ</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="px-6 py-5 bg-white flex flex-col sm:flex-row justify-between items-center gap-5 border-t border-slate-100">
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Phương thức</p>
                      <p className="text-xs font-bold text-slate-700 capitalize">{order.payment_method}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Thành tiền</p>
                      <p className="text-xl font-black text-indigo-600 leading-none">
                        {order.total_money.toLocaleString()}<span className="text-xs ml-1">đ</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-bold text-rose-600 bg-rose-50 px-5 py-2.5 rounded-xl hover:bg-rose-100 transition-all"
                      >
                        <XCircle size={16} />
                        Hủy đơn
                      </button>
                    )}
                    
                    {/* Bọc nút Chi tiết trong Link điều hướng tới trang đơn hàng cụ thể */}
                    <Link href={`/profile/orders/${order.id}`} className="flex-1 sm:flex-none">
                      <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95">
                        Chi tiết
                        <ChevronRight size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}