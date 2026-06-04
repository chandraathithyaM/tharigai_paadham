"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import type { ProductWithDetails } from "@/types";
import { toast } from "sonner";

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const discount = getDiscountPercentage(product.price, product.discount_price);
  const effectivePrice = product.discount_price ?? product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0]?.size || "UK 8";
    const defaultColor = product.colors?.[0]?.name || null;

    addToCart({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discount_price: product.discount_price,
        image: primaryImage?.url || "",
        brand: product.brand,
      },
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
    });
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discount_price: product.discount_price,
      image: primaryImage?.url || "",
      brand: product.brand,
    });
    toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist!");
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden product-card-hover border-0 shadow-sm hover:shadow-lg bg-card">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {primaryImage?.url && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500 text-white">
              -{discount}%
            </Badge>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-sm"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>

          {/* Quick add button */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              onClick={handleAddToCart}
              className="w-full gap-2 bg-primary/90 backdrop-blur-sm"
              size="sm"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{product.avg_rating}</span>
              <span className="text-xs text-muted-foreground">
                ({product.review_count})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">
              {formatPrice(effectivePrice)}
            </span>
            {discount > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
