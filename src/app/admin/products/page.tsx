import { getAllProductsAdmin } from "@/actions/products";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" /> Products Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse, search, edit, or delete items in the store catalog.
          </p>
        </div>
        <Button asChild className="rounded-full gap-1.5 self-start sm:self-center shadow-sm">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
