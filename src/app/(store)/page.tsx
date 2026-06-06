import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Recycle,
  TreePine,
  Heart,
  Sparkles,
} from "lucide-react";
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
import { BRAND_TAGLINE, BRAND_SLOGAN } from "@/lib/constants";

/* ── Decorative section header with leaf ornament ─── */
function SectionHeader({
  title,
  subtitle,
  align = "left",
}: {
  title: string;
  subtitle: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div
        className={`flex items-center gap-2 mb-2 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <Leaf className="h-4 w-4 text-primary/50" />
        <div className="h-px w-8 bg-primary/20" />
      </div>
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}

/* ── Leaf divider between sections ─── */
function LeafDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/15" />
      <Leaf className="h-3.5 w-3.5 text-primary/20" />
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/15" />
    </div>
  );
}

export default async function HomePage() {
  const [
    banners,
    categories,
    featured,
    newArrivals,
    bestSellers,
    menProducts,
    womenProducts,
  ] = await Promise.all([
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
      {/* ══════════════════════════════
          HERO BANNER
          ══════════════════════════════ */}
      <HeroCarousel banners={banners} />

      {/* ══════════════════════════════
          ECO TRUST BADGES
          ══════════════════════════════ */}
      <section className="border-b bg-accent/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Leaf,
                label: "Eco Packaging",
                desc: "Sustainable materials",
              },
              {
                icon: Recycle,
                label: "Easy Returns",
                desc: "7-day return policy",
              },
              {
                icon: TreePine,
                label: "Free Shipping",
                desc: "On orders above ₹999",
              },
              {
                icon: Heart,
                label: "Made with Care",
                desc: "Quality you can trust",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 group">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors duration-300">
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

      {/* ══════════════════════════════
          FEATURED CATEGORIES
          ══════════════════════════════ */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <SectionHeader
            title="Shop by Category"
            subtitle="Find the perfect pair for every occasion"
            align="center"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-10">
            {categories.slice(0, 10).map((category, i) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="group overflow-hidden product-card-hover border border-border/50 shadow-sm hover:shadow-md rounded-2xl">
                  <CardContent className="p-6 text-center space-y-3">
                    <div
                      className="h-16 w-16 mx-auto rounded-2xl flex items-center justify-center text-2xl font-bold text-primary bg-primary/8 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
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

      <LeafDivider />

      {/* ══════════════════════════════
          FEATURED PRODUCTS
          ══════════════════════════════ */}
      {featured.length > 0 && (
        <section className="eco-section-light py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <SectionHeader
                title="Featured Collection"
                subtitle="Handpicked styles for you"
              />
              <Button
                variant="outline"
                asChild
                className="rounded-full gap-2 border-primary/20 hover:bg-primary/5"
              >
                <Link href="/products?featured=true">
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

      {/* ══════════════════════════════
          NEW ARRIVALS
          ══════════════════════════════ */}
      {newArrivals.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-10">
            <SectionHeader
              title="New Arrivals"
              subtitle="Fresh drops just landed"
            />
            <Button
              variant="outline"
              asChild
              className="rounded-full gap-2 border-primary/20 hover:bg-primary/5"
            >
              <Link href="/new-arrivals">
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

      <LeafDivider />

      {/* ══════════════════════════════
          SUSTAINABILITY BANNER
          ══════════════════════════════ */}
      <section className="relative overflow-hidden py-20">
        {/* Green gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a0a] via-[#2d5016] to-[#1a4020]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-green-400/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/60 text-xs tracking-widest uppercase">
            <Sparkles className="h-3 w-3" />
            Our Promise
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight">
            Every Step Leaves a<br />
            <span className="text-green-300">Lighter Footprint</span>
          </h2>
          <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            {BRAND_TAGLINE} We believe in crafting footwear that honours both tradition and nature. 
            From eco-conscious materials to sustainable packaging — every detail matters.
          </p>
          <p className="text-lg text-white/40 italic">
            &ldquo;{BRAND_SLOGAN}&rdquo;
          </p>
          <Button
            size="lg"
            asChild
            className="mt-4 bg-white/90 text-green-900 hover:bg-white rounded-full px-8 gap-2 group"
          >
            <Link href="/products">
              <Leaf className="h-4 w-4 transition-transform group-hover:rotate-12" />
              Shop Sustainably
            </Link>
          </Button>
        </div>
      </section>

      {/* ══════════════════════════════
          BEST SELLERS
          ══════════════════════════════ */}
      {bestSellers.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-10">
            <SectionHeader
              title="Best Sellers"
              subtitle="Most loved by our customers"
            />
            <Button
              variant="outline"
              asChild
              className="rounded-full gap-2 border-primary/20 hover:bg-primary/5"
            >
              <Link href="/best-sellers">
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

      <LeafDivider />

      {/* ══════════════════════════════
          MEN'S COLLECTION
          ══════════════════════════════ */}
      {menProducts.length > 0 && (
        <section className="eco-section-light py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <SectionHeader
                title="Men&apos;s Collection"
                subtitle="Built for performance & style"
              />
              <Button
                variant="outline"
                asChild
                className="rounded-full gap-2 border-primary/20 hover:bg-primary/5"
              >
                <Link href="/products?gender=men">
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

      {/* ══════════════════════════════
          WOMEN'S COLLECTION
          ══════════════════════════════ */}
      {womenProducts.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-10">
            <SectionHeader
              title="Women&apos;s Collection"
              subtitle="Elegant & comfortable styles"
            />
            <Button
              variant="outline"
              asChild
              className="rounded-full gap-2 border-primary/20 hover:bg-primary/5"
            >
              <Link href="/products?gender=women">
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
