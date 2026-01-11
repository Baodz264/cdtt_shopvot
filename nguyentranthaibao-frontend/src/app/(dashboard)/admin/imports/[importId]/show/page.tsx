"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Table, Button, InputNumber, Space, Card, Modal, Spin, Select } from "antd";
import type { ColumnsType } from "antd/es/table";

import ImportService, { Import } from "@/services/ImportService";
import ImportItemService, { ImportItem } from "@/services/ImportItemService";
import ProductService, { ProductPayload } from "@/services/ProductService";
import { useToast } from "@/context/ToastProvider";

interface ProductOption {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface ProductApiResponse {
  data: ProductOption[];
  meta?: Record<string, unknown>;
}

interface ProductDetailResponse {
  data: ProductOption;
}

export default function ImportShowPage() {
  const { importId } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [importData, setImportData] = useState<Import | null>(null);
  const [items, setItems] = useState<ImportItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ImportItem | null>(null);
  const [adding, setAdding] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    const fetchData = async () => {
      if (!importId) return;

      try {
        setLoading(true);

        const importResp: Import = await ImportService.get(Number(importId));
        setImportData(importResp);

        const itemsResp: { data: ImportItem[] } = await ImportItemService.list({
          import_id: Number(importId),
        });
        setItems(itemsResp.data || []);

        const productsResp = await ProductService.list({ page: 1, limit: 100 });
        const res: ProductApiResponse = productsResp.data;
        setProducts(
          res.data?.map((p: ProductOption) => ({
            id: p.id,
            name: p.name,
            price: p.price ?? 0,
            stock: p.stock ?? 0,
          })) || []
        );
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [importId, toast]);

  // ================= SAVE ITEM + UPDATE STOCK =================
  const handleSave = async (item: ImportItem) => {
    try {
      if (!item.product_id || item.product_id <= 0) {
        toast.error("Vui lòng chọn sản phẩm!");
        return;
      }

      let oldQuantity = 0;
      if (!adding) {
        const existing = items.find((i) => i.id === item.id);
        oldQuantity = existing?.quantity || 0;
      }

      let savedItem: ImportItem;

      if (adding) {
        savedItem = await ImportItemService.create({
          import_id: Number(importId),
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        });
        setItems([savedItem, ...items]);
        setAdding(false);
      } else {
        savedItem = await ImportItemService.update(item.id, {
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        });
        setItems(items.map((i) => (i.id === item.id ? savedItem : i)));
      }

      // ================= UPDATE PRODUCT STOCK =================
      const productResp = (await ProductService.get(item.product_id)) as ProductDetailResponse;
      const currentStock = productResp.data?.stock ?? 0;
      const newStock = adding
        ? currentStock + item.quantity
        : currentStock - oldQuantity + item.quantity;

      const productUpdate: ProductPayload = { stock: newStock };
      await ProductService.update(item.product_id, productUpdate);

      setEditingItem(null);
      toast.success("Lưu thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lưu thất bại!");
    }
  };

  // ================= DELETE ITEM =================
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc muốn xóa?",
      okType: "danger",
      onOk: async () => {
        try {
          const deletedItem = items.find((i) => i.id === id);
          if (!deletedItem) return;

          await ImportItemService.delete(id);
          setItems(items.filter((i) => i.id !== id));

          // Giảm stock sản phẩm
          const productResp = (await ProductService.get(deletedItem.product_id)) as ProductDetailResponse;
          const currentStock = productResp.data?.stock ?? 0;
          const newStock = currentStock - deletedItem.quantity;
          const productUpdate: ProductPayload = { stock: newStock };
          await ProductService.update(deletedItem.product_id, productUpdate);

          toast.success("Xóa thành công!");
        } catch (err) {
          console.error(err);
          toast.error("Xóa thất bại!");
        }
      },
    });
  };

  // ================= TABLE COLUMNS =================
  const columns: ColumnsType<ImportItem> = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      render: (_text, record) =>
        editingItem?.id === record.id ? (
          <Select
            style={{ width: 250 }}
            placeholder="Chọn sản phẩm"
            value={editingItem.product_id}
            onChange={(value: number) => {
              const selected = products.find((p) => p.id === value);
              if (selected) {
                setEditingItem({
                  ...editingItem,
                  product_id: selected.id,
                  price: selected.price,
                  product: {
                    id: selected.id,
                    name: selected.name,
                    price: selected.price,
                  },
                });
              }
            }}
          >
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.name} — {p.price.toLocaleString()}₫
              </Select.Option>
            ))}
          </Select>
        ) : (
          record.product?.name || "-"
        ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      align: "center",
      render: (_text, record) =>
        editingItem?.id === record.id ? (
          <InputNumber
            min={1}
            value={editingItem.quantity}
            onChange={(value) =>
              setEditingItem({ ...editingItem, quantity: value || 1 })
            }
          />
        ) : (
          record.quantity
        ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      align: "center",
      render: (_text, record) =>
        editingItem?.id === record.id ? (
          <InputNumber
            min={0}
            value={editingItem.price}
            onChange={(value) =>
              setEditingItem({ ...editingItem, price: value || 0 })
            }
          />
        ) : (
          record.price.toLocaleString()
        ),
    },
    {
      title: "Hành động",
      align: "center",
      render: (_text, record) =>
        editingItem?.id === record.id ? (
          <Space>
            <Button type="primary" onClick={() => handleSave(editingItem)}>
              Lưu
            </Button>
            <Button onClick={() => setEditingItem(null)}>Hủy</Button>
          </Space>
        ) : (
          <Space>
            <Button type="link" onClick={() => setEditingItem(record)}>
              Sửa
            </Button>
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              Xóa
            </Button>
          </Space>
        ),
    },
  ];

  // ================= UI =================
  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!importData) {
    return <div className="p-6 text-center">Không tìm thấy dữ liệu import</div>;
  }

  return (
    <div className="p-6">
      <Card title={`Chi tiết Import #${importData.id}`} className="mb-6 shadow-md">
        <p><strong>Người tạo:</strong> {importData.user?.name || "Unknown"}</p>
        <p><strong>Ghi chú:</strong> {importData.note || "Không có"}</p>
        <p><strong>Ngày tạo:</strong> {importData.created_at}</p>

        <Button
          type="primary"
          className="mt-4"
          onClick={() => {
            setAdding(true);
            setEditingItem({
              id: Date.now(),
              import_id: Number(importId),
              product_id: 0,
              quantity: 1,
              price: 0,
            } as ImportItem);
          }}
        >
          Thêm sản phẩm
        </Button>
      </Card>

      <Card title="Danh sách sản phẩm" className="shadow-md">
        <Table
          dataSource={adding && editingItem ? [editingItem, ...items] : items}
          columns={columns}
          rowKey="id"
          pagination={false}
        />

        <Button type="link" className="mt-4" onClick={() => router.push("/admin/imports")}>
          Quay lại danh sách Import
        </Button>
      </Card>
    </div>
  );
}
