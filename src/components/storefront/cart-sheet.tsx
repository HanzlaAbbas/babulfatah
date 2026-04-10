'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Minus, Plus, Trash2, BookOpen, MessageCircle, AlertTriangle, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCart } from '@/store/use-cart';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    onOpenChange(false);
    router.push('/checkout');
  };

  const buildWhatsAppUrl = () => {
    const lines = items.map(
      (item) =>
        `• ${item.title} x${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString('en-PK')}`
    );
    const subtotal = totalPrice().toLocaleString('en-PK');
    const total = totalPrice();
    const shippingNote = total >= 5000 ? '(FREE Delivery!)' : '(Shipping charges apply)';
    const message = `Assalamu Alaikum! I'd like to order:\n\n${lines.join('\n')}\n\nSubtotal: Rs. ${subtotal}\n${shippingNote}\n\nPlease confirm availability and total amount. JazakAllah!`;
    return `https://wa.me/+923265903300?text=${encodeURIComponent(message)}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 space-y-0">
          <SheetTitle className="flex items-center gap-2.5">
            <ShoppingCart className="h-5 w-5 text-brand" />
            <span className="text-base font-semibold text-foreground">Shopping Cart</span>
            {totalItems() > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-golden text-golden-foreground text-xs font-bold">
                {totalItems()}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <div className="h-20 w-20 rounded-full bg-surface-alt flex items-center justify-center">
                <ShoppingBag className="h-9 w-9 text-muted-foreground/40" />
              </div>
              <div className="space-y-1.5">
                <p className="font-medium text-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">
                  Browse our collection and add some books
                </p>
              </div>
              <Button
                variant="outline"
                className="text-brand border-brand/20 hover:bg-brand/5 rounded-lg"
                onClick={() => onOpenChange(false)}
                asChild
              >
                <Link href="/shop">Browse Books</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item, idx) => (
                <div key={item.productId}>
                  <div className="flex gap-3 py-3">
                    {/* Product image */}
                    {item.image ? (
                      <div className="relative h-20 w-16 rounded-lg overflow-hidden bg-surface shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-16 rounded-lg bg-surface flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate leading-tight">
                        {item.title}
                      </h4>
                      {item.stock !== undefined && item.stock <= 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                          <span className="text-[11px] font-semibold text-red-500 uppercase tracking-wide">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      <p className="text-sm font-semibold text-brand-dark mt-1">
                        Rs. {(item.price * item.quantity).toLocaleString('en-PK')}
                      </p>

                      {/* Quantity & Remove Controls */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-md"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-7 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-md"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-muted-foreground hover:text-crimson rounded-md"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Subtle separator between items */}
                  {idx < items.length - 1 && (
                    <Separator className="opacity-50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <>
            <Separator />
            <SheetFooter className="px-6 py-5 flex-col gap-3 sm:flex-col">
              {/* Free delivery notice */}
              {totalPrice() < 5000 && (
                <p className="text-[11px] text-center text-muted-foreground">
                  Add Rs. {(5000 - totalPrice()).toLocaleString('en-PK')} more for <span className="font-semibold text-golden-dark">FREE Delivery</span>!
                </p>
              )}
              {totalPrice() >= 5000 && (
                <p className="text-[11px] text-center text-green-600 font-semibold">
                  You qualify for FREE Delivery!
                </p>
              )}

              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold text-foreground">
                  Rs. {totalPrice().toLocaleString('en-PK')}
                </span>
              </div>

              {/* Continue Shopping — prominent */}
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl border-brand/20 text-brand hover:bg-brand/5 font-medium text-sm transition-colors"
                onClick={() => onOpenChange(false)}
                asChild
              >
                <Link href="/shop">Continue Shopping</Link>
              </Button>

              {/* Proceed to Checkout */}
              <Button
                className="w-full h-12 rounded-xl bg-golden hover:bg-golden-light text-golden-foreground font-semibold text-sm transition-colors"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>

              {/* Order via WhatsApp — GREEN prominent button */}
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-sm transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Order via WhatsApp
              </a>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
