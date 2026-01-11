"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import OrderService, { Order } from "@/services/OrderService";
import OrderItemService, { OrderItem } from "@/services/OrderItemService";
import ProductService from "@/services/ProductService";
import ProductVariantValueService from "@/services/ProductVariantValueService";
import { Package, Calendar, RefreshCw, ShoppingBag, ArrowRight } from "lucide-react";

/* ================= TYPES ================= */
interface ProductDetail { id: number; name: string; thumbnail: string; price: number; }
interface VariantDetail { id: number; value: string; }
interface OrderItemExtended extends OrderItem { productDetail?: ProductDetail | null; variantDetail?: VariantDetail | null; }
interface AuthUser { id: number; name?: string; fullname?: string; }
interface AuthContextType { user: AuthUser | null; loading: boolean; }

const IMAGE_BASE = "http://localhost:8000";

export default function ProfileOrders() {
  const { user, loading: authLoading } = useAuth() as AuthContextType;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderItemsMap, setOrderItemsMap] = useState<{ [key: number]: OrderItemExtended[] }>({});

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Lấy orders
      const response = await OrderService.list({ user_id: user.id, limit: 10 });
      const ordersData = response.data;
      setOrders(ordersData);

      // 2. Khởi tạo cache để giảm request trùng lặp
      const productCache: { [key: number]: ProductDetail } = {};
      const variantCache: { [key: number]: VariantDetail | null } = {};
      const newItemsMap: { [key: number]: OrderItemExtended[] } = {};

      // 3. Lấy order items từng order
      await Promise.all(ordersData.map(async (order) => {
        const itemsRes = await OrderItemService.list({ order_id: order.id });

        const extendedItems = await Promise.all(itemsRes.data.map(async (item: OrderItem) => {
          const extItem: OrderItemExtended = { ...item };

          // Product
          if (productCache[item.product_id]) {
            extItem.productDetail = productCache[item.product_id];
          } else {
            try {
              const prodRes = await ProductService.get(item.product_id);
              extItem.productDetail = prodRes.data;
              productCache[item.product_id] = prodRes.data;
            } catch (e) {
              console.error("Product fetch error:", e);
            }
          }

          // Variant
          if (item.variant_value_id) {
            if (variantCache[item.variant_value_id] !== undefined) {
              extItem.variantDetail = variantCache[item.variant_value_id];
            } else {
              try {
                const varRes = await ProductVariantValueService.detail(item.variant_value_id);
                extItem.variantDetail = varRes.data;
                variantCache[item.variant_value_id] = varRes.data;
              } catch (e) {
                console.error("Variant fetch error:", e);
                variantCache[item.variant_value_id] = null;
              }
            }
          }

          return extItem;
        }));

        newItemsMap[order.id] = extendedItems;
      }));

      setOrderItemsMap(newItemsMap);

    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { 
    if (!authLoading) fetchOrders(); 
  }, [authLoading, fetchOrders]);

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    const base = "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ";
    if (s === "completed") return base + "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s === "pending") return base + "bg-orange-50 text-orange-600 border-orange-100";
    if (s === "cancelled") return base + "bg-slate-50 text-slate-400 border-slate-200";
    return base + "bg-blue-50 text-blue-600 border-blue-100";
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:py-12">
      {/* Header */}
      <header className="flex justify-between items-end mb-10 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Đơn hàng của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">Lịch sử mua sắm và trạng thái vận chuyển</p>
        </div>
        <button onClick={fetchOrders} className="p-2 hover:bg-slate-50 rounded-full transition-colors group">
          <RefreshCw size={18} className="text-slate-400 group-active:rotate-180 transition-transform" />
        </button>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <ShoppingBag size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden transition-shadow hover:shadow-sm">
              {/* Order Meta */}
              <div className="px-5 py-4 bg-slate-50/30 border-b border-slate-100 flex justify-between items-center">
                <div className="flex gap-6 items-center">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest">Mã đơn hàng</span>
                    <span className="text-sm font-medium text-slate-900">#{order.id}</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest">Ngày đặt</span>
                    <span className="text-sm text-slate-600">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString("vi-VN") : "—"}
                    </span>
                  </div>
                </div>
                <span className={getStatusStyle(order.status)}>{order.status}</span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {orderItemsMap[order.id]?.map((item) => (
                  <div key={item.id} className="p-5 flex items-center gap-5">
                    <img
                      src={item.productDetail?.thumbnail ? `${IMAGE_BASE}${item.productDetail.thumbnail.startsWith("/") ? "" : "/"}${item.productDetail.thumbnail}` : "/images/placeholder.png"}
                      className="w-16 h-16 object-cover rounded border border-slate-100 bg-slate-50"
                      alt="product"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 truncate">
                        {item.productDetail?.name ?? "Sản phẩm không khả dụng"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">
                        {item.variantDetail?.value ?? "Tiêu chuẩn"} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-100 flex justify-between items-center">
                <div className="text-[11px] text-slate-400 flex gap-4 italic font-medium">
                  <span>P.thức: {order.payment_method || "COD"}</span>
                  <span>|</span>
                  <span>Thanh toán: {order.payment_status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Tổng tiền:</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {(order.total_money ?? 0).toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
