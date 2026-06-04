"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "@/actions/products";
import { toast } from "sonner";
import type { ProductWithDetails } from "@/types";

interface ProductsTableProps {
  products: ProductWithDetails[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(null);
    }
  };

  const columns = [
    {
      header: "Product",
      accessorKey: "name",
      cell: (item: ProductWithDetails) => {
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
      cell: (item: ProductWithDetails) => (
        <span className="text-xs font-medium text-muted-foreground">{item.brand || "—"}</span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category.name",
      cell: (item: ProductWithDetails) => (
        <Badge variant="outline" className="text-[10px] font-semibold">
          {item.category?.name || "Uncategorized"}
        </Badge>
      ),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (item: ProductWithDetails) => {
        const hasDiscount = !!item.discount_price;
        return (
          <div className="text-xs font-semibold">
            {hasDiscount ? (
              <div className="space-y-0.5">
                <p className="text-primary">{formatPrice(Number(item.discount_price))}</p>
                <p className="text-[10px] text-muted-foreground line-through">
                  {formatPrice(Number(item.price))}
                </p>
              </div>
            ) : (
              <p className="text-foreground">{formatPrice(Number(item.price))}</p>
            )}
          </div>
        );
      },
    },
    {
      header: "Stock Status",
      accessorKey: "sizes",
      cell: (item: ProductWithDetails) => {
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
      cell: (item: ProductWithDetails) => (
        <Badge variant={item.is_featured ? "default" : "secondary"} className="text-[10px]">
          {item.is_featured ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item: ProductWithDetails) => (
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(item.id)}
            disabled={isDeleting === item.id}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      searchKey="name"
      searchPlaceholder="Search products by name..."
    />
  );
}
