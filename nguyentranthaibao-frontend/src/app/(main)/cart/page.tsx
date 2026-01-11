"use client";

import { useEffect, useState } from "react";
import { Row, Col, Spin, Card, Button, Popconfirm } from "antd";
import { ShoppingCartOutlined, ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";

import { useToast } from "@/context/ToastProvider";
import { useAuth } from "@/context/AuthContext";

import CartService from "@/services/CartService";
import CartItemService from "@/services/CartItemService";
import ProductService from "@/services/ProductService";

import { ExtendedCartItem } from "@/types/cart";

import CartTable from "@/components/client/cart/CartTable";
import CartSummary from "@/components/client/cart/CartSummary";
import EmptyCart from "@/components/client/cart/EmptyCart";

export default function CartPage() {
  const toast = useToast();
  const { user } = useAuth() as {
    user: { id: number } | null;
  };

  const [items, setItems] = useState<ExtendedCartItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH CART =================
  const fetchCartData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const cart = await CartService.getCart(user.id);
      const cartItems = (await CartItemService.list(cart.id)) as ExtendedCartItem[];

      // 🔹 Lấy product details nếu chưa có thumbnail
      const updatedItems = await Promise.all(
        cartItems.map(async (item) => {
          if (!item.product?.thumbnail) {
            try {
              const res = await ProductService.get(item.product_id);
              item.product = { ...item.product, ...res.data };
            } catch {
              // ignore
            }
          }
          return item;
        })
      );

      setItems(updatedItems);
      setSelectedRowKeys(updatedItems.map((i) => i.id));
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [user]);

  // ================= UPDATE QTY =================
  const updateQuantity = async (id: number, quantity: number, price: number) => {
    try {
      await CartItemService.update(id, { quantity, price });
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    } catch {
      toast.error("Cập nhật số lượng thất bại");
    }
  };

  // ================= REMOVE ITEM =================
  const removeItem = async (id: number) => {
    try {
      await CartItemService.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSelectedRowKeys((prev) => prev.filter((k) => k !== id));
      toast.success("Đã xóa sản phẩm");
    } catch {
      toast.error("Xóa sản phẩm thất bại");
    }
  };

  // ================= REMOVE ALL =================
  const removeAllItems = async () => {
    if (!user?.id) return;
    try {
      const cart = await CartService.getCart(user.id);
      if (cart?.id) {
        await CartItemService.clearCart(cart.id);
        setItems([]);
        setSelectedRowKeys([]);
        toast.success("Đã xóa toàn bộ giỏ hàng");
      }
    } catch (err) {
      console.error(err);
      toast.error("Xóa toàn bộ giỏ hàng thất bại");
    }
  };

  // ================= TOTAL =================
  const totalPrice = items
    .filter((i) => selectedRowKeys.includes(i.id))
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ================= GO TO CHECKOUT =================
  const handleCheckout = () => {
    const selectedItems = items.filter((i) => selectedRowKeys.includes(i.id));
    if (!selectedItems.length) {
      toast.error("Chưa chọn sản phẩm");
      return;
    }
    localStorage.setItem("checkout_items", JSON.stringify(selectedItems));
    window.location.href = "/checkout";
  };

  // ================= RENDER =================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!items.length) return <EmptyCart />;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <h2 className="text-2xl mb-8">
        <ShoppingCartOutlined /> Giỏ hàng của bạn
      </h2>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <Card className="shadow-sm">
            <CartTable
              items={items}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={setSelectedRowKeys}
              onQuantityChange={updateQuantity}
              onRemove={removeItem}
            />

            <div className="mt-4 flex gap-4">
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => window.history.back()}
              >
                Quay lại cửa hàng
              </Button>

              <Popconfirm
                title="Bạn có chắc muốn xóa toàn bộ giỏ hàng?"
                onConfirm={removeAllItems}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="primary" danger icon={<DeleteOutlined />}>
                  Xóa tất cả
                </Button>
              </Popconfirm>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <CartSummary
            totalPrice={totalPrice}
            selectedCount={selectedRowKeys.length}
            onCheckout={handleCheckout}
          />
        </Col>
      </Row>
    </div>
  );
}
