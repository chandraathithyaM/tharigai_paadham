import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId, getOrders } from "@/actions/store";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Calendar, ShoppingBag, Eye, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { EmptyState } from "@/components/shared/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and track your order history.",
};

export default async function OrdersPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const dbUser = await getUserByClerkId(clerkUser.id);
  const orders = dbUser ? await getOrders(dbUser.id) : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary shrink-0" /> Order History
        </h1>
        <p className="text-muted-foreground mt-1">
          Track and review your purchases at Tharigai Paadham.
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4 animate-fade-in">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-0">
                {/* Order Top Bar */}
                <div className="bg-muted/40 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Order Number
                    </p>
                    <p className="font-mono text-sm font-bold text-primary">
                      {order.order_number}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        Placed On
                      </p>
                      <p className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="space-y-1 text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        Total Amount
                      </p>
                      <p className="text-sm font-extrabold text-primary">
                        {formatPrice(Number(order.total))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={ORDER_STATUS_COLORS[order.status] || "bg-gray-100"}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        Payment: {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                      </Badge>
                    </div>

                    {/* Preview of items */}
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {order.items.length === 1 ? (
                        <p>
                          Contains <span className="font-semibold text-foreground">{order.items[0].product_name}</span> (Size: {order.items[0].size})
                        </p>
                      ) : (
                        <p>
                          Contains <span className="font-semibold text-foreground">{order.items[0].product_name}</span> and{" "}
                          <span className="font-semibold text-foreground">{order.items.length - 1} other item(s)</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button asChild variant="secondary" className="rounded-full gap-2 shadow-sm">
                      <Link href={`/orders/${order.id}`}>
                        View Details <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Yet"
          description="You haven't placed any orders yet. Check out our store collections to find the perfect footwear."
          actionText="Shop Now"
          actionHref="/products"
        />
      )}
    </div>
  );
}
