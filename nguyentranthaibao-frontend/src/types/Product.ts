export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
  brand?: string;
  categories?: string[];
  description?: string;
  detail?: string;
 

  isNew?: boolean;
  isSale?: boolean;
}

