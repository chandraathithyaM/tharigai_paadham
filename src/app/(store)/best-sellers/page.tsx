import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/store/product-card";
import { ArrowLeft, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Sellers | தரிகை பாதம்",
  description: "Browse our most popular, eco-inspired footwear collection loved by our customers.",
};

export default async function BestSellersPage() {
  // Fetch popular products
  const { data: products } = await getProducts({ sort: "popular", limit: 100 });

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
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none hidden md:flex items-center justify-center font-bold text-[180px] select-none text-amber-500 leading-none">
          ✨
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
            Most Popular
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight gradient-text-gold" style={{ color: "#d4a853" }}>
            அதிகம் விற்பனையாகும் தயாரிப்புகள்
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Our most loved creations. Walk with ultimate comfort and step with pride in our best-selling, eco-conscious designs.
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
          title="No Products Found"
          description="We are updating our best selling collections. Check back soon!"
          actionText="Shop Our Collection"
          actionHref="/products"
        />
      )}
    </div>
  );
}
