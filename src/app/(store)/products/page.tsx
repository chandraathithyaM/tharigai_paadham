import { Suspense } from "react";
import { ProductCard } from "@/components/store/product-card";
import { getProducts } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCT_SORT_OPTIONS, GENDER_OPTIONS, BRANDS } from "@/lib/constants";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our complete collection of premium footwear - sneakers, crocs, slides, formal shoes, and more.",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    category?: string;
    gender?: string;
    brand?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const categories = await getCategories();
  const { data: products, totalPages, total } = await getProducts({
    page,
    sort: params.sort as "newest" | "popular" | "price-asc" | "price-desc",
    category: params.category,
    gender: params.gender,
    brand: params.brand,
    search: params.search,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
  });

  const activeFilters = [
    params.category && { label: `Category: ${params.category}`, key: "category" },
    params.gender && { label: `Gender: ${params.gender}`, key: "gender" },
    params.brand && { label: `Brand: ${params.brand}`, key: "brand" },
    params.search && { label: `Search: ${params.search}`, key: "search" },
  ].filter(Boolean);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const current = { ...params, ...overrides };
    const searchParamsObj = new URLSearchParams();
    Object.entries(current).forEach(([key, value]) => {
      if (value && value !== "") searchParamsObj.set(key, value);
    });
    return `/products?${searchParamsObj.toString()}`;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {params.search ? `Search results for "${params.search}"` : "All Products"}
        </h1>
        <p className="text-muted-foreground mt-1">{total} products found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          {/* Search */}
          <form action="/products" method="get">
            <Input name="search" placeholder="Search products..." defaultValue={params.search} />
          </form>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Categories</h3>
            <div className="space-y-1">
              <Link href={buildUrl({ category: undefined, page: "1" })}>
                <Button variant={!params.category ? "secondary" : "ghost"} size="sm" className="w-full justify-start text-sm">
                  All Categories
                </Button>
              </Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={buildUrl({ category: cat.slug, page: "1" })}>
                  <Button
                    variant={params.category === cat.slug ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-sm"
                  >
                    {cat.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Gender</h3>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((g) => (
                <Link key={g.value} href={buildUrl({ gender: params.gender === g.value ? undefined : g.value, page: "1" })}>
                  <Badge variant={params.gender === g.value ? "default" : "outline"} className="cursor-pointer">
                    {g.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Brands</h3>
            <div className="flex flex-wrap gap-2">
              {BRANDS.slice(0, 8).map((brand) => (
                <Link key={brand} href={buildUrl({ brand: params.brand === brand ? undefined : brand, page: "1" })}>
                  <Badge variant={params.brand === brand ? "default" : "outline"} className="cursor-pointer text-xs">
                    {brand}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort & Active Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((f) => f && (
                <Link key={f.key} href={buildUrl({ [f.key]: undefined, page: "1" })}>
                  <Badge variant="secondary" className="cursor-pointer gap-1">
                    {f.label} ×
                  </Badge>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
              {PRODUCT_SORT_OPTIONS.map((opt) => (
                <Link key={opt.value} href={buildUrl({ sort: opt.value, page: "1" })}>
                  <Badge
                    variant={params.sort === opt.value || (!params.sort && opt.value === "newest") ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                  >
                    {opt.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-2xl font-semibold mb-2">No products found</p>
                <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                <Button asChild>
                  <Link href="/products">Clear all filters</Link>
                </Button>
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildUrl({ page: String(page - 1) })}>Previous</Link>
                </Button>
              )}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link href={buildUrl({ page: String(p) })}>{p}</Link>
                  </Button>
                );
              })}
              {page < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildUrl({ page: String(page + 1) })}>Next</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
