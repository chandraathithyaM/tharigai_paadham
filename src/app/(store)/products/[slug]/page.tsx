import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ShoppingBag, Heart, Truck, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/store/product-card";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { getProductBySlug, getRelatedProducts } from "@/actions/products";
import { getProductReviews } from "@/actions/store";
import { formatPrice, getDiscountPercentage, getStockStatus } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.description || `Buy ${product.name} at best price`,
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [reviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product.id, product.category_id),
  ]);

  const discount = getDiscountPercentage(product.price, product.discount_price);
  const effectivePrice = product.discount_price ?? product.price;
  const stockStatus = getStockStatus(product.sizes || []);
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-primary">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {primaryImage?.url && (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt_text || product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-500 text-white text-sm px-3 py-1">
                -{discount}% OFF
              </Badge>
            )}
          </div>
          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((img) => (
                <div key={img.id} className="relative aspect-square rounded-md overflow-hidden bg-muted border-2 border-transparent hover:border-primary transition-colors cursor-pointer">
                  <Image src={img.url} alt={img.alt_text || ""} fill className="object-cover" sizes="120px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {product.brand && (
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {product.brand}
            </p>
          )}

          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.avg_rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.avg_rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.review_count} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(effectivePrice)}</span>
            {discount > 0 && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="success" className="text-sm">
                  Save {formatPrice(product.price - effectivePrice)}
                </Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <Badge variant={stockStatus === "in_stock" ? "success" : stockStatus === "low_stock" ? "warning" : "destructive"}>
            {stockStatus === "in_stock" ? "In Stock" : stockStatus === "low_stock" ? "Low Stock" : "Out of Stock"}
          </Badge>

          <Separator />

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Add to Cart Section */}
          <AddToCartButton product={product} />

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>Free shipping above ₹999</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Genuine products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review: { id: string; rating: number; title: string | null; comment: string | null; created_at: string; user: { full_name: string | null; avatar_url: string | null } }) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="font-medium text-sm">{review.user?.full_name || "Customer"}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.title && <p className="font-medium">{review.title}</p>}
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
