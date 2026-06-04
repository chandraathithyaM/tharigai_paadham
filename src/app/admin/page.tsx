import { getDashboardStats, getMonthlySales, getOrders } from "@/actions/store";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalesChart } from "@/components/admin/sales-chart";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";

export default async function AdminDashboardPage() {
  const [stats, salesData, recentOrders] = await Promise.all([
    getDashboardStats(),
    getMonthlySales(),
    getOrders(),
  ]);

  const cards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      desc: "Total earnings from paid orders",
      icon: IndianRupee,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      title: "Orders Placed",
      value: stats.totalOrders,
      desc: "All lifetime order checkouts",
      icon: ShoppingBag,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      desc: "Registered client accounts",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockProducts,
      desc: "Product sizes with ≤5 items left",
      icon: AlertTriangle,
      color: stats.lowStockProducts > 0
        ? "text-rose-600 dark:text-rose-400 bg-rose-500/10"
        : "text-muted-foreground bg-muted",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time statistics and sales analytics.</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Revenue Analytics
            </CardTitle>
            <CardDescription>Sales earnings over the past 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesData} />
          </CardContent>
        </Card>

        {/* Low Stock Alerts and Quick Actions */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
            <CardDescription>Manage and control inventory options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start rounded-full text-xs">
              <Link href="/admin/products/new">Add a New Product</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full justify-start rounded-full text-xs">
              <Link href="/admin/coupons">Manage Promo Coupons</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-full text-xs">
              <Link href="/admin/inventory">Review Low Stock Alerts</Link>
            </Button>

            {stats.lowStockProducts > 0 && (
              <div className="flex gap-2 items-start border border-dashed border-rose-500/30 bg-rose-500/5 p-4 rounded-xl text-xs mt-4">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-rose-700 dark:text-rose-400">Inventory Alert</p>
                  <p className="text-muted-foreground leading-relaxed">
                    There are {stats.lowStockProducts} products running low on stock. Please restock soon.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders List */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
            <CardDescription>Latest customer purchase orders.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="-mr-3 text-xs">
            <Link href="/admin/orders" className="flex items-center gap-1">
              View All <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 font-medium text-muted-foreground border-b text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-xs">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="p-4 text-xs font-semibold">
                      {(order.shipping_address as any)?.full_name || "Guest"}
                    </td>
                    <td className="p-4">
                      <Badge className={ORDER_STATUS_COLORS[order.status] || "bg-gray-100"}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right font-bold text-xs">
                      {formatPrice(Number(order.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
