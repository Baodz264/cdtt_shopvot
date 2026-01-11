// User trả về từ backend
export interface User {
  id: number;
  name: string;
  avatar?: string | null;
  is_verified?: boolean;
}

// Ảnh review (bảng review_images)
export interface ReviewImage {
  id: number;
  review_id: number;
  image: string;
}

// Reply của admin / shop
export interface ReviewReply {
  id: number;
  review_id: number;
  reply: string;
  user?: User;
  created_at?: string;
}

// Review chính
export interface Review {
  id: number;
  user_id?: number | null;
  product_id: number;

  rating: number;
  content?: string | null;
  status?: "pending" | "approved" | "rejected";

  created_at?: string;

  user?: User;
  images?: ReviewImage[];
  replies?: ReviewReply[];

  likes?: number;
  dislikes?: number;
}
