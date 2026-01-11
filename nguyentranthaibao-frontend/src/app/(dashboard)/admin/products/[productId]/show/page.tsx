"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Spin, Form } from "antd";
import type { UploadFile } from "antd/es/upload/interface";

import ProductService from "@/services/ProductService";
import ProductImageService, { ProductImagePayload } from "@/services/ProductImageService";
import ProductVariantService, { VariantPayload } from "@/services/ProductVariantService";
import ProductVariantValueService, { ProductVariantValuePayload } from "@/services/ProductVariantValueService";

import ProductInfoCard from "@/components/admin/product/ProductInfoCard";
import ProductImagesCard from "@/components/admin/product/ProductImagesCard";
import ProductVariantsCard from "@/components/admin/product/ProductVariantsCard";
import ImageModal from "@/components/admin/modals/ImageModal";
import VariantModal from "@/components/admin/modals/VariantModal";
import VariantValueModal from "@/components/admin/modals/VariantValueModal";

import { useToast } from "@/context/ToastProvider";

const IMAGE_BASE = "http://localhost:8000";

// ================= INTERFACES =================
interface Product { id: number; name: string; price: number; sale_price?: number; stock: number; slug: string; description?: string; thumbnail?: string }
interface ProductImage { id: number; product_id?: number; image: string; caption?: string }
interface ImageModalProductImage extends ProductImage { caption: string; url: string }
interface ProductVariant { id: number; product_id?: number; name: string; sku?: string; image?: string }
interface ProductVariantValue { id: number; variant_id?: number; value: string; extra_price?: number; stock?: number; thumbnail?: string }
interface VariantPayloadWithSku extends VariantPayload { sku?: string }

export default function ProductShow() {
  const { productId } = useParams();
  const id = useMemo(
    () => (typeof productId === "string" ? Number(productId) : undefined),
    [productId]
  );

  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantValues, setVariantValues] = useState<Record<number, ProductVariantValue[]>>({});

  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [valueModalOpen, setValueModalOpen] = useState(false);

  const [editingImage, setEditingImage] = useState<ImageModalProductImage | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [editingValue, setEditingValue] = useState<ProductVariantValue | null>(null);
  const [valueParentVariantId, setValueParentVariantId] = useState<number | null>(null);

  const [imgForm] = Form.useForm();
  const [variantForm] = Form.useForm();
  const [valueForm] = Form.useForm();
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [valueUploadFileList, setValueUploadFileList] = useState<UploadFile[]>([]);

  // ================= LOAD DATA =================
  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ProductService.get(id!);
      setProduct(res.data?.data ?? res.data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadImages = useCallback(async () => {
    const res = await ProductImageService.list({ product_id: id });
    setImages(res.data?.data ?? []);
  }, [id]);

  const loadVariants = useCallback(async () => {
    const res = await ProductVariantService.list({ product_id: id });
    const data: ProductVariant[] = res.data?.data ?? [];
    setVariants(data);

    const map: Record<number, ProductVariantValue[]> = {};
    await Promise.all(
      data.map(async (v) => {
        const values = await ProductVariantValueService.list({ variant_id: v.id });
        map[v.id] = values.data?.data ?? [];
      })
    );
    setVariantValues(map);
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadImages();
      loadVariants();
    }
  }, [id, loadProduct, loadImages, loadVariants]);

  // ================= SUBMIT =================
  const handleSubmit = useCallback(async (type: "image" | "variant" | "value") => {
    if (!id) return toast.error("Thiếu ID sản phẩm.");

    try {
      if (type === "image") {
        if (uploadFileList.length === 0) return toast.error("Vui lòng chọn ít nhất 1 ảnh");

        if (editingImage) {
          // Sửa ảnh
          const payload: ProductImagePayload = {
            product_id: id,
            image: uploadFileList[0]?.originFileObj || null,
          };
          await ProductImageService.update(editingImage.id, payload);
          toast.success("Đã cập nhật ảnh thành công");
        } else {
          // Thêm nhiều ảnh
          await Promise.all(
            uploadFileList.map((file) => {
              const payload: ProductImagePayload = {
                product_id: id,
                image: file.originFileObj || null,
              };
              return ProductImageService.create(payload);
            })
          );
          toast.success(`Đã lưu ${uploadFileList.length} ảnh`);
        }

        setImgModalOpen(false);
        setUploadFileList([]);
        setEditingImage(null);
        loadImages();
      }

      else if (type === "variant") {
        const values = await variantForm.validateFields();
        const payload: VariantPayloadWithSku = {
          product_id: id,
          name: values.name,
          sku: values.sku,
        };
        editingVariant
          ? await ProductVariantService.update(editingVariant.id, payload)
          : await ProductVariantService.create(payload);
        toast.success(editingVariant ? "Đã cập nhật biến thể" : "Đã thêm biến thể");
        setVariantModalOpen(false);
        loadVariants();
      }

      else if (type === "value") {
        if (!valueParentVariantId) return toast.error("Thiếu ID biến thể");
        const values = await valueForm.validateFields();
        const payload: ProductVariantValuePayload = {
          variant_id: valueParentVariantId,
          value: values.value,
          extra_price: values.extra_price,
          stock: values.stock,
          thumbnail: valueUploadFileList[0]?.originFileObj || null,
        };
        editingValue
          ? await ProductVariantValueService.update(editingValue.id, payload)
          : await ProductVariantValueService.create(payload);
        toast.success(editingValue ? "Đã cập nhật giá trị biến thể" : "Đã thêm giá trị biến thể");
        setValueModalOpen(false);
        setValueUploadFileList([]);
        loadVariants();
      }
    } catch {
      toast.error("Lỗi khi lưu");
    }
  }, [
    id,
    editingImage,
    editingVariant,
    editingValue,
    valueParentVariantId,
    uploadFileList,
    valueUploadFileList,
    imgForm,
    variantForm,
    valueForm,
    loadImages,
    loadVariants,
    toast,
  ]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <ProductInfoCard product={product!} />

      <ProductImagesCard
        images={images}
        onAdd={() => {
          setEditingImage(null);
          imgForm.resetFields();
          setUploadFileList([]);
          setImgModalOpen(true);
        }}
        onEdit={(img) => {
          const imgCap = img as ProductImage & { caption?: string };
          setEditingImage({
            ...imgCap,
            caption: imgCap.caption ?? "",
            url: `${IMAGE_BASE}/${imgCap.image}`,
          });
          imgForm.setFieldsValue({ caption: imgCap.caption ?? "" });
          setImgModalOpen(true);
        }}
        onDelete={async (id) => {
          await ProductImageService.delete(id);
          toast.success("Đã xoá ảnh");
          loadImages();
        }}
        onDeleteMultiple={async (ids) => {
          await Promise.all(ids.map((id) => ProductImageService.delete(id)));
          toast.success(`Đã xoá ${ids.length} ảnh`);
          loadImages();
        }}
        onReload={loadImages}
      />

      <ProductVariantsCard
        variants={variants}
        variantValues={variantValues}
        onAddVariant={() => {
          setEditingVariant(null);
          variantForm.resetFields();
          setVariantModalOpen(true);
        }}
        onEditVariant={(v) => {
          setEditingVariant(v);
          variantForm.setFieldsValue(v);
          setVariantModalOpen(true);
        }}
        onDeleteVariant={async (id) => {
          await ProductVariantService.delete(id);
          toast.success("Đã xoá biến thể");
          loadVariants();
        }}
        onAddValue={(variantId) => {
          setEditingValue(null);
          setValueParentVariantId(variantId);
          valueForm.resetFields();
          setValueUploadFileList([]);
          setValueModalOpen(true);
        }}
        onEditValue={(value, variantId) => {
          setEditingValue(value);
          setValueParentVariantId(variantId);
          valueForm.setFieldsValue(value);
          setValueModalOpen(true);
        }}
        onDeleteValue={async (id) => {
          await ProductVariantValueService.delete(id);
          toast.success("Đã xoá giá trị biến thể");
          loadVariants();
        }}
      />

      <ImageModal
        open={imgModalOpen}
        onCancel={() => setImgModalOpen(false)}
        onSubmit={() => handleSubmit("image")}
        form={imgForm}
        editingImage={editingImage ?? undefined}
        uploadFileList={uploadFileList}
        setUploadFileList={setUploadFileList}
      />

      <VariantModal
        open={variantModalOpen}
        onCancel={() => setVariantModalOpen(false)}
        onSubmit={() => handleSubmit("variant")}
        form={variantForm}
        editingVariant={editingVariant ?? undefined}
      />

      <VariantValueModal
        open={valueModalOpen}
        onCancel={() => setValueModalOpen(false)}
        onSubmit={() => handleSubmit("value")}
        form={valueForm}
        editingValue={editingValue ?? undefined}
        uploadFileList={valueUploadFileList}
        setUploadFileList={setValueUploadFileList}
      />
    </div>
  );
}
