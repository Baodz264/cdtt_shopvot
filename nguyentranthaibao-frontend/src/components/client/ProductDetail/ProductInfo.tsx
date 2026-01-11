"use client";

import { Tag, Typography } from "antd";
import ProductVariants from "./ProductVariants";
import ProductQuantity from "./ProductQuantity";
import AddToCartButton from "./AddToCartButton";

const { Title, Text } = Typography;

/* ================= TYPES ================= */

interface VariantValue {
  id: number;
  value: string;
  extra_price: number;
}

interface Variant {
  id: number;
  name: string;
  values: VariantValue[];
}

interface SelectedVariants {
  [variantId: number]: VariantValue;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  brand?: string;
  isNew?: boolean;
}

interface ProductInfoProps {
  product: Product;
  variants: Variant[];
  selectedVariants: SelectedVariants;
  setSelectedVariants: React.Dispatch<
    React.SetStateAction<SelectedVariants>
  >;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  activeImage: string;
}

/* ================= COMPONENT ================= */

export default function ProductInfo({
  product,
  variants,
  selectedVariants,
  setSelectedVariants,
  quantity,
  setQuantity,
  activeImage,
}: ProductInfoProps) {
  const extraPrice = Object.values(selectedVariants).reduce(
    (sum, v) => sum + v.extra_price,
    0
  );

  const finalPrice =
    (product.salePrice ?? product.price) + extraPrice;

  return (
    <div>
      <Tag color="red">{product.brand || "CHÍNH HÃNG"}</Tag>
      {product.isNew && <Tag color="green">MỚI</Tag>}

      <Title>{product.name}</Title>

      <Text className="text-4xl font-bold text-red-600">
        {finalPrice.toLocaleString()}đ
      </Text>

      <ProductVariants
        variants={variants}
        selected={selectedVariants}
        onSelect={setSelectedVariants}
      />

      <ProductQuantity
        quantity={quantity}
        setQuantity={setQuantity}
      />

      <AddToCartButton
        product={product}
        variants={variants}
        selectedVariants={selectedVariants}
        quantity={quantity}
        price={finalPrice}
        image={activeImage}
      />
    </div>
  );
}
