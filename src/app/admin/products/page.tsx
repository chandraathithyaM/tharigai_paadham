import { getAllProductsAdmin, deleteProduct } from "@/actions/products";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  // Helper action to delete product from table
  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deleteProduct(id);
      revalidatePath("/admin/products");
      redirect("/admin/products");
    }
  }

  const columns = [
    {
      header: "Product",
      accessorKey: "name",
      cell: (item: any) => {
        const primaryImage = item.images?.find((img: any) => img.is_primary) || item.images?.[0];
        return (
          <div className="flex items-center gap-3 text-xs">
            <div className="relative h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted/20">
              {primaryImage && (
                <img src={primaryImage.url} alt={item.name} className="object-cover h-full w-full" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{item.name}</p>
              <p className="text-muted-foreground font-mono text-[10px]">{item.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Brand",
      accessorKey: "brand",
      cell: (item: any) => (
        <span className="text-xs font-medium text-muted-foreground">{item.brand || "—"}</span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category.name",
      cell: (item: any) => (
        <Badge variant="outline" className="text-[10px] font-semibold">
          {item.category?.name || "Uncategorized"}
        </Badge>
      ),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (item: any) => {
        const hasDiscount = !!item.discount_price;
        return (
          <div className="text-xs font-semibold">
            {hasDiscount ? (
              <div className="space-y-0.5">
                <p className="text-primary">{formatPrice(item.discount_price)}</p>
                <p className="text-[10px] text-muted-foreground line-through">
                  {formatPrice(item.price)}
                </p>
              </div>
            ) : (
              <p className="text-foreground">{formatPrice(item.price)}</p>
            )}
          </div>
        );
      },
    },
    {
      header: "Stock Status",
      accessorKey: "sizes",
      cell: (item: any) => {
        const totalStock = item.sizes?.reduce((sum: number, s: any) => sum + s.stock, 0) || 0;
        return (
          <div className="text-xs space-y-1">
            <p className="font-semibold">
              {totalStock === 0 ? (
                <span className="text-rose-600 dark:text-rose-400">Out of Stock</span>
              ) : totalStock <= 5 ? (
                <span className="text-amber-600 dark:text-amber-400">Low Stock ({totalStock})</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">In Stock ({totalStock})</span>
              )}
            </p>
          </div>
        );
      },
    },
    {
      header: "Featured",
      accessorKey: "is_featured",
      cell: (item: any) => (
        <Badge variant={item.is_featured ? "default" : "secondary"} className="text-[10px]">
          {item.is_featured ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item: any) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Link href={`/products/${item.slug}`} target="_blank">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Link href={`/admin/products/${item.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <form action={handleDelete}>
            <input type="hidden" name="id" value={item.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ),
    },
  ];

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

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search products by name..."
      />
    </div>
  );
}
