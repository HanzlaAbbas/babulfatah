export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  metaDescription?: string | null;
  price: number;
  stock: number;
  sku?: string | null;
  language: string;
  weight?: number | null;
  tags?: string | null;
  category: { id: string; name: string; slug: string };
  author?: { id: string; name: string } | null;
  images: { id: string; url: string; altText?: string | null }[];
  _count?: { orderItems: number };
}
