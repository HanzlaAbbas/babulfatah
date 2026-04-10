'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/use-cart';

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    stock: number;
    images?: { id: string; url: string; altText?: string | null }[];
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCart((s) => s.addItem);
  const inStock = product.stock > 0;
  const imageUrl = product.images?.[0]?.url || '';

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: imageUrl,
    });
    // Cart sheet auto-opens via the store's addItem method
  };

  return (
    <Button
      size="lg"
      className={`w-full h-12 text-base font-semibold gap-2 transition-all duration-200 ${
        inStock
          ? 'bg-golden hover:bg-golden-hover text-golden-foreground shadow-md hover:shadow-lg active:scale-[0.98]'
          : 'bg-muted text-muted-foreground cursor-not-allowed'
      }`}
      disabled={!inStock}
      onClick={handleAddToCart}
    >
      <ShoppingCart className="h-5 w-5" />
      {inStock ? 'Add to Cart' : 'Out of Stock'}
    </Button>
  );
}
