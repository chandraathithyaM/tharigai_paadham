"use client";

import { useState } from "react";
import { ShoppingBag, Heart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { ProductWithDetails } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: ProductWithDetails;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || "");
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];

  const selectedSizeStock = product.sizes?.find((s) => s.size === selectedSize)?.stock || 0;
  const isOutOfStock = selectedSizeStock === 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

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
      size: selectedSize,
      color: selectedColor || null,
      quantity,
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/checkout";
  };

  const handleToggleWishlist = () => {
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
    <div className="space-y-6">
      {/* Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Select Size</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size.size)}
                disabled={size.stock === 0}
                className={cn(
                  "h-10 min-w-[60px] px-3 rounded-md border text-sm font-medium transition-all",
                  selectedSize === size.size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:border-primary",
                  size.stock === 0 && "opacity-40 cursor-not-allowed line-through"
                )}
              >
                {size.size}
              </button>
            ))}
          </div>
          {selectedSize && selectedSizeStock <= 5 && selectedSizeStock > 0 && (
            <p className="text-sm text-orange-500 mt-2">Only {selectedSizeStock} left in stock!</p>
          )}
        </div>
      )}

      {/* Colors */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">
            Color: <span className="text-muted-foreground font-normal">{selectedColor}</span>
          </h3>
          <div className="flex gap-3">
            {product.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.name)}
                className={cn(
                  "h-9 w-9 rounded-full border-2 transition-all",
                  selectedColor === color.name
                    ? "border-primary scale-110 ring-2 ring-primary ring-offset-2"
                    : "border-gray-300 hover:scale-105"
                )}
                style={{ backgroundColor: color.hex_code }}
                title={color.name}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <h3 className="font-medium mb-3">Quantity</h3>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium text-lg">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(10, quantity + 1))}
            disabled={quantity >= 10}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || !selectedSize}
          className="flex-1 gap-2"
          size="lg"
        >
          <ShoppingBag className="h-5 w-5" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={isOutOfStock || !selectedSize}
          variant="secondary"
          className="flex-1"
          size="lg"
        >
          Buy Now
        </Button>
        <Button
          onClick={handleToggleWishlist}
          variant="outline"
          size="lg"
          className="px-4"
        >
          <Heart className={cn("h-5 w-5", isInWishlist && "fill-red-500 text-red-500")} />
        </Button>
      </div>
    </div>
  );
}
