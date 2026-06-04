import Link from "next/link";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { ProductCard } from "@/components/store/product-card";
import {
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getProductsByGender,
} from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { getBanners } from "@/actions/store";

export default async function HomePage() {
  const [banners, categories, featured, newArrivals, bestSellers, menProducts, womenProducts] =
    await Promise.all([
      getBanners(),
      getCategories(),
      getFeaturedProducts(),
      getNewArrivals(),
      getBestSellers(),
      getProductsByGender("men"),
      getProductsByGender("women"),
    ]);

  return (
    <div className="space-y-0">
      {/* Hero Banner */}
      <HeroCarousel banners={banners} />

      {/* Trust Badges */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: "Free Shipping", desc: "On orders above ₹999" },
              { icon: Shield, label: "Secure Payment", desc: "100% secure checkout" },
              { icon: RefreshCw, label: "Easy Returns", desc: "7-day return policy" },
              { icon: Headphones, label: "24/7 Support", desc: "Dedicated support" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
            <p className="text-muted-foreground">Find the perfect pair for every occasion</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.slice(0, 10).map((category, i) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="group overflow-hidden product-card-hover border-0 shadow-sm hover:shadow-md">
                  <CardContent className="p-6 text-center space-y-2">
                    <div
                      className="h-16 w-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-primary bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {category.name.charAt(0)}
                    </div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Featured Collection</h2>
                <p className="text-muted-foreground mt-1">Handpicked styles for you</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/products?featured=true" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">New Arrivals</h2>
              <p className="text-muted-foreground mt-1">Fresh drops just landed</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products?sort=newest" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Promotional Banner */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 text-white">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Summer Sale is Live!</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Get up to 50% off on selected styles. Use code <span className="font-bold text-white">SUMMER25</span> at checkout.
          </p>
          <Button size="xl" variant="secondary" asChild className="mt-4">
            <Link href="/products">Shop the Sale</Link>
          </Button>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Best Sellers</h2>
              <p className="text-muted-foreground mt-1">Most loved by our customers</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products?sort=popular" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Men's Collection */}
      {menProducts.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Men&apos;s Collection</h2>
                <p className="text-muted-foreground mt-1">Built for performance & style</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/products?gender=men" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {menProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Women's Collection */}
      {womenProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Women&apos;s Collection</h2>
              <p className="text-muted-foreground mt-1">Elegant & comfortable styles</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products?gender=women" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {womenProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
