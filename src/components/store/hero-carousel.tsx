"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Banner } from "@/types";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  banners: Banner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (!banners.length) {
    return (
      <section className="relative h-[50vh] md:h-[70vh] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white space-y-4 px-4">
          <h1 className="text-4xl md:text-6xl font-bold">Tharigai Paadham</h1>
          <p className="text-lg md:text-xl text-gray-300">Premium Footwear Collection</p>
          <Button size="xl" asChild className="mt-4">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[50vh] md:h-[70vh] overflow-hidden group">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-in-out",
            index === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
        >
          <Image
            src={banner.image_url}
            alt={banner.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-xl space-y-4 animate-fade-in">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-lg md:text-xl text-white/80">
                    {banner.subtitle}
                  </p>
                )}
                {banner.link_url && (
                  <Button size="xl" asChild className="mt-2">
                    <Link href={banner.link_url}>Shop Now</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === current
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
