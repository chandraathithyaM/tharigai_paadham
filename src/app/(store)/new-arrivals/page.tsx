import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/store/product-card";
import { ArrowLeft, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Arrivals | தரிகை பாதம்",
  description: "Explore the latest additions of eco-friendly, premium footwear from Tharigai Paadham.",
};

export default async function NewArrivalsPage() {
  // Fetch newest products
  const { data: products } = await getProducts({ sort: "newest", limit: 100 });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs & Back */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link href="/products" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to all products
          </Link>
        </Button>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-muted/40 p-8 md:p-12 mb-8 border border-border/55">
        {/* Decorative botanical element overlay */}
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none hidden md:flex items-center justify-center font-bold text-[180px] select-none text-primary leading-none">
          🌿
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            Fresh Arrivals
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight gradient-text">
            புதிய வரவுகள்
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Walk with nature. Explore our latest collection of premium, sustainable footwear crafted with care and rooted in Tamil heritage.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No New Arrivals Found"
          description="We are preparing our new collection. Check back shortly!"
          actionText="Shop Our Collection"
          actionHref="/products"
        />
      )}
    </div>
  );
}
