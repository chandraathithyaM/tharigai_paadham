import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId, getOrderById } from "@/actions/store";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, MapPin, CreditCard, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { Metadata } from "next";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Order Details",
  description: "View itemized details and invoice for your purchase.",
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) {
    redirect("/");
  }

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  // Security: only allow the user who placed the order or an admin to view it
  if (order.user_id !== dbUser.id && dbUser.role !== "admin") {
    redirect("/orders");
  }

  const shippingAddress = order.shipping_address as any;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Back link */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link href="/orders" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to My Orders
          </Link>
        </Button>
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            Order ID: {order.order_number}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`text-sm py-1 px-3 ${ORDER_STATUS_COLORS[order.status] || "bg-gray-100"}`}>
            Status: {ORDER_STATUS_LABELS[order.status] || order.status}
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">
            Payment: {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ordered items and info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items card */}
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Ordered Items</h2>
              <div className="divide-y">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-20 w-20 rounded-md border overflow-hidden shrink-0 bg-muted/20">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="object-cover h-full w-full"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-sm leading-none">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Size: {item.size} {item.color ? `| Color: ${item.color}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × {formatPrice(Number(item.price))}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Payment details card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery address */}
            <Card className="border shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Delivery Address
                </h2>
                {shippingAddress ? (
                  <div className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                    <p className="font-semibold text-foreground">{shippingAddress.full_name}</p>
                    <p>{shippingAddress.phone}</p>
                    <p>{shippingAddress.address_line1}</p>
                    {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
                    <p>
                      {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No address stored.</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="border shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment Information
                </h2>
                <div className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                  <p>
                    Method: <span className="font-semibold text-foreground uppercase">{order.payment_method}</span>
                  </p>
                  <p>
                    Status: <span className="font-semibold text-foreground uppercase">{order.payment_status}</span>
                  </p>
                  {order.razorpay_payment_id && (
                    <p>
                      Payment ID: <span className="font-mono">{order.razorpay_payment_id}</span>
                    </p>
                  )}
                  {order.razorpay_order_id && (
                    <p>
                      Payment Order: <span className="font-mono">{order.razorpay_order_id}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Invoice Summary sidebar */}
        <div className="space-y-6">
          <Card className="border bg-card/65 backdrop-blur-md">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(Number(order.subtotal))}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{formatPrice(Number(order.discount_amount))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {Number(order.shipping_amount) === 0
                      ? "Free"
                      : formatPrice(Number(order.shipping_amount))}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-bold">Total Paid</span>
                  <span className="font-extrabold text-lg text-primary">
                    {formatPrice(Number(order.total))}
                  </span>
                </div>
              </div>

              {order.tracking_number && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-xs space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-primary">
                    <ShieldCheck className="h-4 w-4" /> Tracking Information
                  </p>
                  <p className="text-muted-foreground">
                    Tracking Number: <span className="font-mono text-foreground font-bold">{order.tracking_number}</span>
                  </p>
                </div>
              )}

              <Separator />

              {/* Support */}
              <div className="text-[11px] text-muted-foreground space-y-2 text-center">
                <p>Need help with this order?</p>
                <div className="flex items-center justify-center gap-4 text-xs font-semibold">
                  <a
                    href="mailto:support@tharigaipaadham.com"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Mail className="h-3 w-3" /> Email
                  </a>
                  <a
                    href="https://wa.me/919688822826"
                    target="_blank"
                    className="flex items-center gap-1 hover:text-primary transition-colors text-green-600 dark:text-green-400"
                  >
                    <Phone className="h-3 w-3" /> WhatsApp
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
