"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Table, Button, InputNumber, Space, Card, Modal, Spin, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useReactToPrint } from "react-to-print";
import { PrinterOutlined, LeftOutlined, PlusOutlined } from "@ant-design/icons";

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
  const printRef = useRef<HTMLDivElement>(null);

  const [importData, setImportData] = useState<Import | null>(null);
  const [items, setItems] = useState<ImportItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ImportItem | null>(null);
  const [adding, setAdding] = useState(false);

  // ================= CẤU HÌNH IN =================
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Phieu_Nhap_Kho_${importId}`,
  });

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

      const productResp = (await ProductService.get(item.product_id)) as ProductDetailResponse;
      const currentStock = productResp.data?.stock ?? 0;
      const newStock = adding
        ? currentStock + item.quantity
        : currentStock - oldQuantity + item.quantity;

      await ProductService.update(item.product_id, { stock: newStock });
      setEditingItem(null);
      toast.success("Lưu thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lưu thất bại!");
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc muốn xóa sản phẩm này khỏi phiếu nhập?",
      okType: "danger",
      onOk: async () => {
        try {
          const deletedItem = items.find((i) => i.id === id);
          if (!deletedItem) return;
          await ImportItemService.delete(id);
          setItems(items.filter((i) => i.id !== id));

          const productResp = (await ProductService.get(deletedItem.product_id)) as ProductDetailResponse;
          const currentStock = productResp.data?.stock ?? 0;
          await ProductService.update(deletedItem.product_id, { stock: currentStock - deletedItem.quantity });
          toast.success("Xóa thành công!");
        } catch (err) {
          toast.error("Xóa thất bại!");
        }
      },
    });
  };

  // Tính tổng tiền phiếu nhập
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // ================= TABLE COLUMNS =================
  const columns: ColumnsType<ImportItem> = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      render: (_text, record) =>
        editingItem?.id === record.id ? (
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn sản phẩm"
            value={editingItem.product_id}
            onChange={(value: number) => {
              const selected = products.find((p) => p.id === value);
              if (selected) {
                setEditingItem({
                  ...editingItem,
                  product_id: selected.id,
                  price: selected.price,
                  product: { id: selected.id, name: selected.name, price: selected.price },
                });
              }
            }}
          >
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.name} ({p.price.toLocaleString()}₫)
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
            onChange={(value) => setEditingItem({ ...editingItem, quantity: value || 1 })}
          />
        ) : record.quantity,
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      align: "right",
      render: (_text, record) =>
        editingItem?.id === record.id ? (
          <InputNumber
            min={0}
            value={editingItem.price}
            onChange={(value) => setEditingItem({ ...editingItem, price: value || 0 })}
          />
        ) : `${record.price.toLocaleString()}₫`,
    },
    {
      title: "Thành tiền",
      align: "right",
      className: "print-only-cell",
      render: (_, record) => `${(record.quantity * record.price).toLocaleString()}₫`,
    },
    {
      title: "Hành động",
      align: "center",
      className: "no-print", // Ẩn khi in
      render: (_text, record) =>
        editingItem?.id === record.id ? (
          <Space>
            <Button type="primary" size="small" onClick={() => handleSave(editingItem)}>Lưu</Button>
            <Button size="small" onClick={() => setEditingItem(null)}>Hủy</Button>
          </Space>
        ) : (
          <Space>
            <Button type="link" size="small" onClick={() => setEditingItem(record)}>Sửa</Button>
            <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>Xóa</Button>
          </Space>
        ),
    },
  ];

  if (loading) return <div className="p-6 text-center"><Spin size="large" /></div>;
  if (!importData) return <div className="p-6 text-center">Không tìm thấy dữ liệu</div>;

  return (
    <div className="p-6">
      {/* THANH CÔNG CỤ NGOÀI VÙNG IN */}
      <div className="mb-4 flex justify-between items-center">
        <Button icon={<LeftOutlined />} onClick={() => router.push("/admin/imports")}>
          Quay lại
        </Button>
        <Space>
          <Button 
            icon={<PrinterOutlined />} 
            onClick={() => handlePrint()}
            disabled={adding}
          >
            In phiếu nhập
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
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
        </Space>
      </div>

      {/* VÙNG SẼ ĐƯỢC IN */}
      <div ref={printRef} className="print-wrapper">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: A4; margin: 20mm; }
            .no-print { display: none !important; }
            .ant-card { border: none !important; box-shadow: none !important; }
            .ant-card-head { border-bottom: 2px solid #000 !important; }
            .print-wrapper { padding: 0; color: #000; }
            .ant-table-thead > tr > th { background: #f0f0f0 !important; color: #000 !important; }
          }
        `}} />

        <Card className="mb-6 shadow-md border-t-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold uppercase mb-4">Phiếu Nhập Kho</h1>
              <p><strong>Mã phiếu:</strong> #{importData.id}</p>
              <p><strong>Ngày tạo:</strong> {importData.created_at}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-lg">Bảo vippro</h3>
              <p>Địa chỉ: 109 Tăng nhơn Phú</p>
              <p>Điện thoại: 0353819007</p>
            </div>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <p><strong>Người phụ trách:</strong> {importData.user?.name || "N/A"}</p>
            <p><strong>Ghi chú:</strong> {importData.note || "..."}</p>
          </div>
        </Card>

        <Card title="Danh mục hàng hóa" className="shadow-md">
          <Table
            dataSource={adding && editingItem ? [editingItem, ...items] : items}
            columns={columns}
            rowKey="id"
            pagination={false}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <strong className="text-lg">Tổng cộng:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong className="text-lg text-red-600">{totalAmount.toLocaleString()}₫</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} className="no-print" />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <div className="mt-12 hidden print:flex justify-around text-center">
            <div>
              <p className="font-bold">Người lập phiếu</p>
              <p className="italic text-sm">(Ký, họ tên)</p>
            </div>
            <div>
              <p className="font-bold">Người giao hàng</p>
              <p className="italic text-sm">(Ký, họ tên)</p>
            </div>
            <div>
              <p className="font-bold">Thủ kho</p>
              <p className="italic text-sm">(Ký, họ tên)</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}