import { getOrders } from "@/actions/store";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Eye, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const columns = [
    {
      header: "Order Number",
      accessorKey: "order_number",
      cell: (item: any) => (
        <span className="font-mono font-bold text-xs text-primary">{item.order_number}</span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "shipping_address.full_name",
      cell: (item: any) => (
        <div className="text-xs font-semibold text-foreground">
          <p>{item.shipping_address?.full_name || "Guest"}</p>
          <p className="text-[10px] text-muted-foreground font-mono">
            {(item.user as any)?.email || "no-email"}
          </p>
        </div>
      ),
    },
    {
      header: "Date Placed",
      accessorKey: "created_at",
      cell: (item: any) => (
        <span className="text-xs text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: any) => (
        <Badge className={ORDER_STATUS_COLORS[item.status] || "bg-gray-100"}>
          {ORDER_STATUS_LABELS[item.status] || item.status}
        </Badge>
      ),
    },
    {
      header: "Payment Status",
      accessorKey: "payment_status",
      cell: (item: any) => (
        <Badge variant={item.payment_status === "paid" ? "default" : "outline"} className="text-[10px] uppercase font-bold tracking-wider">
          {PAYMENT_STATUS_LABELS[item.payment_status] || item.payment_status}
        </Badge>
      ),
    },
    {
      header: "Total paid",
      accessorKey: "total",
      cell: (item: any) => (
        <span className="text-xs font-extrabold text-foreground">{formatPrice(Number(item.total))}</span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item: any) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Link href={`/admin/orders/${item.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

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

      <DataTable
        columns={columns}
        data={orders}
        searchKey="order_number"
        searchPlaceholder="Search by order number (e.g. TP-)..."
      />
    </div>
  );
}
