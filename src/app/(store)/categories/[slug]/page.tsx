import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/store/product-card";
import { ArrowLeft, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import type { Metadata } from "next";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Collection`,
    description: category.description || `Explore our premium selection of ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Fetch products inside this category
  const { data: products } = await getProducts({ category: slug, limit: 100 });

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

      {/* Category Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-muted/40 p-8 md:p-12 mb-8 border border-border/55">
        <div className="relative z-10 max-w-2xl space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-base text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:flex items-center justify-center font-bold text-[180px] select-none text-muted-foreground leading-none">
          {category.name.charAt(0)}
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
          description={`We don't have any items in the ${category.name} category right now. Check back soon!`}
          actionText="Shop Other Collections"
          actionHref="/products"
        />
      )}
    </div>
  );
}
