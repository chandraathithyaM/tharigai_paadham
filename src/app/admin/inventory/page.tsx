import { getAllInventory, restockProductSize } from "@/actions/products";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, ArrowUpRight } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminInventoryPage() {
  const inventory = await getAllInventory();

  // Server action to restock
  async function handleRestock(formData: FormData) {
    "use server";
    const sizeId = formData.get("size_id") as string;
    const productId = formData.get("product_id") as string;
    const size = formData.get("size") as string;
    const previousStock = parseInt(formData.get("previous_stock") as string) || 0;
    const newStock = parseInt(formData.get("new_stock") as string) || 0;

    if (sizeId && productId && size) {
      await restockProductSize({
        sizeId,
        productId,
        size,
        newStock,
        previousStock,
        notes: "Admin quick restock",
      });
      revalidatePath("/admin/inventory");
      redirect("/admin/inventory");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" /> Inventory Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor product size stock counts, restock listings, and check low stock alerts.
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Inventory Log Levels</CardTitle>
          <CardDescription>Listed in ascending order of stock availability (refill alert first).</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 font-medium text-muted-foreground border-b text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">UK Size</th>
                  <th className="p-4">Available Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {inventory.length > 0 ? (
                  inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-xs text-foreground">
                          {item.product?.name}
                        </p>
                        {item.product?.brand && (
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                            {item.product.brand}
                          </p>
                        )}
                      </td>
                      <td className="p-4 font-bold text-xs">
                        {item.size}
                      </td>
                      <td className="p-4 text-xs font-semibold">
                        {item.stock}
                      </td>
                      <td className="p-4">
                        {item.stock === 0 ? (
                          <Badge variant="destructive" className="text-[10px] flex items-center gap-1 w-max">
                            <AlertTriangle className="h-3 w-3 shrink-0" /> Sold Out
                          </Badge>
                        ) : item.stock <= 5 ? (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/25 flex items-center gap-1 w-max">
                            <AlertTriangle className="h-3 w-3 shrink-0" /> Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/25 flex items-center gap-1 w-max">
                            Healthy
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <form action={handleRestock} className="flex items-center justify-end gap-2">
                          <input type="hidden" name="size_id" value={item.id} />
                          <input type="hidden" name="product_id" value={item.product_id} />
                          <input type="hidden" name="size" value={item.size} />
                          <input type="hidden" name="previous_stock" value={item.stock} />
                          <Input
                            type="number"
                            name="new_stock"
                            defaultValue={item.stock}
                            className="w-20 text-center h-8 text-xs font-semibold rounded-full bg-card"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="secondary"
                            className="h-8 rounded-full text-xs font-semibold px-4"
                          >
                            Update
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                      No stock listings configured yet. Create a product with sizes to view catalog levels.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
