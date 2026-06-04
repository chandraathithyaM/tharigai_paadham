"use client";

import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();
  const shippingThreshold = 999;
  const shippingFee = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 100;
  const total = subtotal + shippingFee;

  const handleUpdateQuantity = (
    productId: string,
    size: string,
    color: string | null,
    currentQty: number,
    delta: number
  ) => {
    const newQty = currentQty + delta;
    if (newQty >= 1) {
      updateQuantity(productId, size, color, newQty);
    }
  };

  const handleRemoveItem = (
    productId: string,
    size: string,
    color: string | null,
    name: string
  ) => {
    removeItem(productId, size, color);
    toast.success(`${name} removed from cart`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary shrink-0" /> Shopping Cart
        </h1>
        <p className="text-muted-foreground mt-1">
          {items.length === 1 ? "1 item in your cart" : `${items.length} items in your cart`}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {subtotal < shippingThreshold && (
              <div className="flex items-center gap-3 bg-muted/40 p-4 rounded-xl border border-dashed border-primary/20 text-sm">
                <Truck className="h-5 w-5 text-primary animate-bounce shrink-0" />
                <p>
                  Add <span className="font-semibold">{formatPrice(shippingThreshold - subtotal)}</span> more for <span className="font-semibold text-primary">Free Shipping</span>!
                </p>
              </div>
            )}

            <div className="divide-y border rounded-xl overflow-hidden bg-card">
              {items.map((item) => {
                const itemPrice = item.product.discount_price ?? item.product.price;
                return (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-muted/10 transition-colors animate-fade-in"
                  >
                    {/* Product Image */}
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border shrink-0 bg-muted/20">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {item.product.brand && (
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                              {item.product.brand}
                            </p>
                          )}
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-medium text-base hover:text-primary transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            handleRemoveItem(
                              item.product.id,
                              item.size,
                              item.color,
                              item.product.name
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-1">
                        <span className="bg-muted px-2 py-1 rounded">Size: {item.size}</span>
                        {item.color && (
                          <span className="bg-muted px-2 py-1 rounded">Color: {item.color}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-start sm:gap-12 pt-3">
                        {/* Quantity controls */}
                        <div className="flex items-center border rounded-full p-0.5 bg-muted/30">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.product.id,
                                item.size,
                                item.color,
                                item.quantity,
                                -1
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.product.id,
                                item.size,
                                item.color,
                                item.quantity,
                                1
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Pricing */}
                        <div className="text-right sm:text-left">
                          <p className="font-bold text-base">{formatPrice(itemPrice * item.quantity)}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              ({formatPrice(itemPrice)} each)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div>
            <Card className="sticky top-24 border bg-card/65 backdrop-blur-md">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-lg font-bold">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild size="lg" className="w-full rounded-full gap-2 font-semibold">
                    <Link href="/checkout">
                      Proceed to Checkout <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full rounded-full">
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="Your Cart is Empty"
          description="It looks like you haven't added any footwear to your cart yet. Explore our latest arrivals to find your fit."
          actionText="Start Shopping"
          actionHref="/products"
        />
      )}
    </div>
  );
}
