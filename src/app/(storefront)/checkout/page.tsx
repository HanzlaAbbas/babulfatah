'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Phone,
  MapPin,
  Home,
  ShoppingCart,
  ArrowLeft,
  MessageCircle,
  BookOpen,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { checkoutSchema, type CheckoutInput } from '@/lib/validations/checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="md:col-span-2 h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { items, totalPrice, discountAmount, finalPrice, coupon, clearCartAndCoupon } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      city: '',
      address: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const showSuccess = !!orderId;

  const onSubmit = async (data: CheckoutInput) => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/storefront/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          couponCode: coupon?.code || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to place order');
      }

      setOrderId(result.orderId);
      clearCartAndCoupon();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const lines = items.map(
      (item) =>
        `• ${item.title} x${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString('en-PK')}`
    );
    const subtotal = totalPrice().toFixed(2);
    const discount = discountAmount();
    const total = finalPrice().toFixed(2);
    let message = `📱 *New Order — Bab-ul-Fatah*\n\n` +
        `📝 *Items:*\n${lines.join('\n')}\n\n` +
        `💰 *Subtotal: Rs. ${subtotal}*\n`;
    if (discount > 0 && coupon) {
      message += `🏷️ *Discount (${coupon.discountPercent}%): -Rs. ${discount.toFixed(2)}*\n`;
      message += `🎫 *Coupon: ${coupon.code}*\n`;
    }
    message += `💰 *Total: Rs. ${total}*\n` +
        `📦 *Payment: Cash on Delivery*\n\n` +
        `Please share your delivery details (Name, Phone, City, Address).`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/+923265903300?text=${encoded}`, '_blank');
    window.open(`https://wa.me/+923265903300?text=${message}`, '_blank');
  };

  // ── Success state ─────────────────────────────────────────
  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground mt-2">
              Your order has been received. We&apos;ll contact you to confirm the
              details.
            </p>
          </div>
          <Card className="mx-auto max-w-sm">
            <CardContent className="p-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono font-medium">{orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <Badge variant="outline">Cash on Delivery</Badge>
              </div>
            </CardContent>
          </Card>
          <Button className="bg-brand hover:bg-brand-light" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Empty cart ────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <BookOpen className="h-16 w-16 text-muted-foreground/20 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground">
            Add some books to your cart before checking out.
          </p>
          <Button className="bg-brand hover:bg-brand-light" asChild>
            <Link href="/shop">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Checkout form ─────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Checkout
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete your order details below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* ── Left: Shipping Details ──────────────────────────── */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
                <CardDescription>
                  All fields are required for delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Muhammad Ahmed"
                      className="pl-9"
                      {...register('fullName')}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-destructive text-xs">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+92 300 1234567"
                      className="pl-9"
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-destructive text-xs">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    Shipping City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="city"
                      placeholder="Lahore"
                      className="pl-9"
                      {...register('city')}
                    />
                  </div>
                  {errors.city && (
                    <p className="text-destructive text-xs">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Detailed Address
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      placeholder="House #123, Street 5, Gulberg III"
                      rows={3}
                      className="pl-9"
                      {...register('address')}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-destructive text-xs">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Order Summary ────────────────────────────── */}
          <div className="md:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-start gap-3"
                    >
                      <div className="h-10 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × Rs. {item.price.toLocaleString('en-PK')}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        Rs. {(item.price * item.quantity).toLocaleString('en-PK')}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({items.length} items)
                    </span>
                    <span className="font-medium">
                      Rs. {totalPrice().toLocaleString('en-PK')}
                    </span>
                  </div>
                  {discountAmount() > 0 && coupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        Coupon ({coupon.discountPercent}% off)
                      </span>
                      <span className="font-medium">
                        -Rs. {discountAmount().toLocaleString('en-PK')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-brand">
                    Rs. {finalPrice().toLocaleString('en-PK')}
                  </span>
                </div>

                {coupon && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-xs text-green-600">
                      Coupon applied: <strong>{coupon.code}</strong>
                    </span>
                    <span className="text-xs font-semibold text-green-700">
                      {coupon.discountPercent}% off
                    </span>
                  </div>
                )}

                {/* COD Badge */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <span className="text-xs text-muted-foreground">
                    Payment Method:
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Cash on Delivery
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-brand hover:bg-brand-dark text-white font-semibold h-11"
                    disabled={submitting}
                  >
                    {submitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {submitting
                      ? 'Placing Order...'
                      : 'Confirm Order (Cash on Delivery)'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 font-medium h-11"
                    onClick={handleWhatsAppOrder}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Order via WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}
