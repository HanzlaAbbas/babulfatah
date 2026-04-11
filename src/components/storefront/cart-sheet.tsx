'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Minus, Plus, Trash2, BookOpen, MessageCircle,
  AlertTriangle, Tag, X, Check, Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const {
    items, removeItem, updateQuantity, totalPrice, totalItems,
    discountAmount, finalPrice, coupon,
    applyCoupon, removeCoupon,
  } = useCart();
  const router = useRouter();

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [couponMsg, setCouponMsg] = useState('');

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim();
    if (!code) return;

    setCouponStatus('loading');
    setCouponMsg('');

    try {
      const res = await fetch('/api/storefront/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.valid) {
        setCouponStatus('success');
        setCouponMsg(`${data.discountPercent}% off applied!`);
        applyCoupon(data.code, data.discountPercent);
        setCouponInput('');
      } else {
        setCouponStatus('error');
        setCouponMsg(data.message);
      }
    } catch {
      setCouponStatus('error');
      setCouponMsg('Network error. Please try again.');
    }
  }, [couponInput, applyCoupon]);

  const handleRemoveCoupon = useCallback(() => {
    removeCoupon();
    setCouponStatus('idle');
    setCouponMsg('');
  }, [removeCoupon]);

  const handleCheckout = () => {
    onOpenChange(false);
    router.push('/checkout');
  };

  const buildWhatsAppUrl = () => {
    const lines = items.map(
      (item) =>
        `* ${item.title} x${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString('en-PK')}`
    );
    const subtotal = totalPrice().toLocaleString('en-PK');
    const discount = discountAmount();
    let message = `Assalamu Alaikum! I'd like to order:\n\n${lines.join('\n')}\n\nSubtotal: Rs. ${subtotal}`;
    if (discount > 0) {
      message += `\nDiscount (${coupon?.discountPercent}%): -Rs. ${discount.toLocaleString('en-PK')}`;
      message += `\n**Total: Rs. ${finalPrice().toLocaleString('en-PK')}**`;
      message += `\nCoupon: ${coupon?.code}`;
    }
    return `https://wa.me/+923265903300?text=${encodeURIComponent(message)}`;
  };

  const subtotal = totalPrice();
  const discount = discountAmount();
  const total = finalPrice();
  const hasDiscount = discount > 0;

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
                <BookOpen className="h-9 w-9 text-muted-foreground/40" />
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

            {/* ── Coupon Section ── */}
            <div className="px-6 py-3">
              {coupon ? (
                /* Applied coupon badge */
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">{coupon.code}</span>
                    <span className="text-xs text-green-600">({coupon.discountPercent}% off)</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-green-100 text-green-500 hover:text-green-700 transition-colors"
                    aria-label="Remove coupon"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                /* Coupon input */
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Discount code"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponStatus('idle');
                        setCouponMsg('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleApplyCoupon();
                      }}
                      className="h-9 text-sm font-mono tracking-wider placeholder:normal-case"
                      maxLength={20}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 text-xs font-semibold text-brand border-brand/20 hover:bg-brand/5 shrink-0"
                      onClick={handleApplyCoupon}
                      disabled={couponStatus === 'loading' || !couponInput.trim()}
                    >
                      {couponStatus === 'loading' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                  {couponMsg && (
                    <p className={`text-xs flex items-center gap-1 ${
                      couponStatus === 'error' ? 'text-red-500' : 'text-green-600'
                    }`}>
                      {couponStatus === 'success' && <Check className="h-3 w-3 shrink-0" />}
                      {couponMsg}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <SheetFooter className="px-6 py-5 flex-col gap-3 sm:flex-col">
              {/* Price breakdown */}
              <div className="w-full space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm text-foreground tabular-nums">
                    Rs. {subtotal.toLocaleString('en-PK')}
                  </span>
                </div>
                {hasDiscount && (
                  <div className="flex items-center justify-between text-green-600">
                    <span className="text-sm flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      Discount ({coupon?.discountPercent}%)
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      -Rs. {discount.toLocaleString('en-PK')}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-bold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    Rs. {total.toLocaleString('en-PK')}
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-12 rounded-xl bg-golden hover:bg-golden-light text-golden-foreground font-semibold text-sm transition-colors"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Shipping &amp; taxes calculated at checkout
              </p>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-center text-golden hover:text-golden-dark transition-colors mt-1"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Order via WhatsApp
              </a>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
