"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { getProducts } from "@/actions/products";
import { Search, Loader2, X, ShoppingBag, Tag, Grid } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = React.useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);

  const [results, setResults] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(!!initialQuery);

  // Sync URL search params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router]);

  // Fetch results when debounced query changes
  React.useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      try {
        const { data } = await getProducts({ search: debouncedQuery, limit: 12 });
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const popularSearches = ["Sneakers", "Crocs", "Slides", "Running Shoes", "Nike", "Adidas"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[60vh] space-y-8">
      {/* Search Input Section */}
      <div className="flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto text-center mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Search Tharigai Paadham</h1>
        <p className="text-muted-foreground text-sm">
          Find your perfect fit by brand, style, color, or collection.
        </p>

        <div className="w-full relative flex items-center mt-2">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type brand name, sneaker, sizes..."
            className="pl-12 pr-10 py-6 text-base rounded-full bg-muted/40 focus-visible:ring-primary shadow-sm"
            autoFocus
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Search tags */}
      {!hasSearched && (
        <div className="max-w-xl mx-auto space-y-4 pt-4 text-center">
          <h2 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-center gap-1.5">
            <Tag className="h-3 w-3" /> Popular Searches
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {popularSearches.map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => setQuery(term)}
                className="rounded-full text-xs font-semibold"
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Searching the catalog...</p>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && !isLoading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Grid className="h-4 w-4 text-muted-foreground" /> Search Results ({results.length})
            </h2>
            {results.length > 0 && (
              <Button variant="ghost" size="sm" asChild className="-mr-3">
                <Link href={`/products?search=${debouncedQuery}`}>
                  Refine with filters
                </Link>
              </Button>
            )}
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="No Products Found"
              description={`We couldn't find any footwear matching "${query}". Try searching for something else like Nike or Sneakers.`}
              actionText="View All Products"
              actionHref="/products"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading search...</p>
        </div>
      }
    >
      <SearchContent />
    </React.Suspense>
  );
}
