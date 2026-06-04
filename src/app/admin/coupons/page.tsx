import { getCoupons, createCoupon, deleteCoupon } from "@/actions/store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  // Server actions
  async function handleCreateCoupon(formData: FormData) {
    "use server";
    const code = (formData.get("code") as string)?.toUpperCase();
    const description = formData.get("description") as string;
    const discount_type = formData.get("discount_type") as "percentage" | "fixed";
    const discount_value = parseFloat(formData.get("discount_value") as string) || 0;
    const min_order_amount = parseFloat(formData.get("min_order_amount") as string) || 0;
    const usage_limit = formData.get("usage_limit") ? parseInt(formData.get("usage_limit") as string) : null;
    const expires_at = formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : null;

    if (!code || !discount_type || !discount_value) return;

    await createCoupon({
      code,
      description: description || null,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount: null,
      usage_limit,
      is_active: true,
      expires_at,
    });

    revalidatePath("/admin/coupons");
    redirect("/admin/coupons");
  }

  async function handleDeleteCoupon(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deleteCoupon(id);
      revalidatePath("/admin/coupons");
      redirect("/admin/coupons");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Tag className="h-8 w-8 text-primary" /> Coupons Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Create, list, or delete coupon codes for checkout promo discounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Coupons list */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Promo Codes</CardTitle>
              <CardDescription>All defined store discount codes.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 font-medium text-muted-foreground border-b text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Code</th>
                      <th className="p-4">Value</th>
                      <th className="p-4">Min Spend</th>
                      <th className="p-4">Limit / Used</th>
                      <th className="p-4">Expiry</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {coupons.length > 0 ? (
                      coupons.map((coupon) => (
                        <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-mono font-bold text-xs text-primary">
                            {coupon.code}
                          </td>
                          <td className="p-4 text-xs font-semibold">
                            {coupon.discount_type === "percentage"
                              ? `${coupon.discount_value}%`
                              : formatPrice(coupon.discount_value)}
                          </td>
                          <td className="p-4 text-xs">
                            {formatPrice(coupon.min_order_amount)}
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {coupon.used_count} / {coupon.usage_limit || "∞"}
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {coupon.expires_at
                              ? new Date(coupon.expires_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="p-4 text-right">
                            <form action={handleDeleteCoupon}>
                              <input type="hidden" name="id" value={coupon.id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                          No active coupon codes. Create one on the right panel!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Add coupon form */}
        <div>
          <Card className="border shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-base font-bold">New Coupon</CardTitle>
              <CardDescription>Configure a new discount code.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleCreateCoupon} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input id="code" name="code" required placeholder="e.g. SUMMER25" className="uppercase font-mono" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="e.g. Get 25% off during summer sale" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount_type">Type *</Label>
                    <select
                      id="discount_type"
                      name="discount_type"
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_value">Value *</Label>
                    <Input id="discount_value" name="discount_value" type="number" required placeholder="25" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_order_amount">Min Spend (₹)</Label>
                    <Input id="min_order_amount" name="min_order_amount" type="number" defaultValue={0} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usage_limit">Usage Limit</Label>
                    <Input id="usage_limit" name="usage_limit" type="number" placeholder="Leave empty for ∞" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiration Date</Label>
                  <Input id="expires_at" name="expires_at" type="date" />
                </div>

                <Button type="submit" className="w-full rounded-full font-semibold gap-1.5 mt-2">
                  <Plus className="h-4 w-4" /> Create Coupon
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
