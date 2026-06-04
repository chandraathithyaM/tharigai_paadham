"use client";

import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { ProductCard } from "@/components/store/product-card";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items: wishlistItems, removeItem, clearWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((s) => s.addItem);

  const handleAddToCart = (product: any) => {
    addItemToCart({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discount_price: product.discount_price,
        image: product.image,
        brand: product.brand,
      },
      size: "UK 8", // Default placeholder size
      color: null,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary shrink-0" /> My Wishlist
          </h1>
          <p className="text-muted-foreground mt-1">
            {wishlistItems.length === 1
              ? "1 saved product"
              : `${wishlistItems.length} saved products`}
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearWishlist();
              toast.success("Wishlist cleared");
            }}
            className="self-start sm:self-center border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Clear Wishlist
          </Button>
        )}
      </div>

      {/* Grid */}
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistItems.map((product) => {
            // Map the wishlist item format to the ProductWithDetails format expected by ProductCard
            const cardProduct = {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              discount_price: product.discount_price,
              brand: product.brand,
              description: "",
              category_id: null,
              gender: null,
              is_featured: false,
              is_active: true,
              total_sold: 0,
              avg_rating: 4.5,
              review_count: 5,
              meta_title: null,
              meta_description: null,
              created_at: "",
              updated_at: "",
              category: null,
              images: [{ id: "", product_id: product.id, url: product.image, alt_text: product.name, sort_order: 0, is_primary: true }],
              sizes: [],
              colors: [],
            };
            return (
              <div key={product.id} className="relative group">
                <ProductCard product={cardProduct} />
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      removeItem(product.id);
                      toast.success(`${product.name} removed from wishlist`);
                    }}
                    className="h-8 w-8 rounded-full shadow-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save items you like to buy them later. Explore our premium collections to get started."
          actionText="Discover Products"
          actionHref="/products"
        />
      )}
    </div>
  );
}
