import { notFound, redirect } from "next/navigation";
import { getOrderById, updateOrderStatus } from "@/actions/store";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, MapPin, CreditCard, ShieldCheck, Mail, Phone, Calendar, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  // Server actions for updates
  async function handleUpdateStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    if (status) {
      await updateOrderStatus(id, status);
      revalidatePath(`/admin/orders/${id}`);
    }
  }

  async function handleUpdateTracking(formData: FormData) {
    "use server";
    const tracking_number = formData.get("tracking_number") as string;
    const supabase = createAdminClient();
    await supabase.from("orders").update({ tracking_number }).eq("id", id);
    revalidatePath(`/admin/orders/${id}`);
  }

  const shippingAddress = order.shipping_address as any;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Back link */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link href="/admin/orders" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order Invoice</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            Invoice Ref: {order.order_number}
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
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
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

          {/* Delivery & Billing details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery address */}
            <Card className="border shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Shipping Details
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

            {/* Payment Details */}
            <Card className="border shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment Summary
                </h2>
                <div className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                  <p>
                    Customer ID: <span className="font-mono text-[10px]">{order.user_id || "Guest"}</span>
                  </p>
                  <p>
                    Name: <span className="font-semibold text-foreground">{order.user?.full_name || "Guest Customer"}</span>
                  </p>
                  <p>
                    Email: <span className="font-semibold text-foreground">{order.user?.email || "No email"}</span>
                  </p>
                  <Separator className="my-2" />
                  <p>
                    Method: <span className="font-semibold text-foreground uppercase">{order.payment_method}</span>
                  </p>
                  <p>
                    Status: <span className="font-semibold text-foreground uppercase">{order.payment_status}</span>
                  </p>
                  {order.razorpay_payment_id && (
                    <p>
                      Payment Ref: <span className="font-mono">{order.razorpay_payment_id}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Status & Actions */}
        <div className="space-y-6">
          {/* Update Status Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">Fulfillment Status</CardTitle>
              <CardDescription>Update delivery phase.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleUpdateStatus} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Fulfillment Phase</Label>
                  <Select name="status" defaultValue={order.status}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full rounded-full text-xs font-semibold">
                  Update Phase
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Tracking Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-muted-foreground" /> Tracking Information
              </CardTitle>
              <CardDescription>Set logistics reference.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleUpdateTracking} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tracking_number">Logistics Reference / ID</Label>
                  <Input
                    id="tracking_number"
                    name="tracking_number"
                    defaultValue={order.tracking_number || ""}
                    placeholder="e.g. Delhivery-123456"
                  />
                </div>
                <Button type="submit" variant="secondary" className="w-full rounded-full text-xs font-semibold">
                  Save Reference
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card className="border shadow-sm">
            <CardContent className="p-6 space-y-4 text-xs text-muted-foreground">
              <h3 className="font-bold text-sm text-foreground">Invoice Calculations</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{formatPrice(Number(order.discount_amount))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{Number(order.shipping_amount) === 0 ? "Free" : formatPrice(Number(order.shipping_amount))}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-bold text-foreground">
                  <span>Total Paid</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
