import { getOrders } from "@/actions/store";
import { Receipt } from "lucide-react";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Receipt className="h-8 w-8 text-primary" /> Orders Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Track and edit customer purchase invoices and delivery fulfillment statuses.
        </p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
