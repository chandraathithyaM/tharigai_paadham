"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Banner } from "@/types";
import { cn } from "@/lib/utils";
import { BRAND_SLOGAN, BRAND_SLOGAN_EN, BRAND_TAGLINE, SITE_NAME } from "@/lib/constants";

/* ── Decorative leaf SVG for floating particles ─── */
function FloatingLeaf({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
    </svg>
  );
}

/* ── Botanical corner decoration ─── */
function CornerDecoration({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const posClasses = {
    "top-left": "top-4 left-4 rotate-0",
    "top-right": "top-4 right-4 rotate-90",
    "bottom-left": "bottom-4 left-4 -rotate-90",
    "bottom-right": "bottom-4 right-4 rotate-180",
  };

  return (
    <div className={cn("absolute opacity-20 pointer-events-none", posClasses[position])}>
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M0 60 Q0 0 60 0" className="text-white/40" />
        <path d="M8 60 Q8 8 60 8" className="text-white/20" />
        <circle cx="30" cy="30" r="2" fill="currentColor" className="text-white/20" />
      </svg>
    </div>
  );
}

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

  /* ══════════════════════════════════════════════════
     FALLBACK HERO — "முள்ளுக்கு நன்றி" Centerpiece
     ══════════════════════════════════════════════════ */
  if (!banners.length) {
    return (
      <section className="relative min-h-[85vh] md:min-h-[90vh] overflow-hidden flex items-center justify-center">
        {/* Local fallback background image */}
        <Image
          src="/images/hero-banner.png"
          alt="Tharigai Paadham Eco Footwear"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/55" />

        {/* Animated radial glow */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-green-400/20 via-transparent to-transparent rounded-full animate-breathe" />
        </div>

        {/* Floating leaf particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <FloatingLeaf
              key={i}
              className="absolute text-white/15 animate-leaf-float"
              style={{
                left: `${10 + i * 12}%`,
                bottom: "-40px",
                animationDelay: `${i * 2}s`,
                animationDuration: `${12 + i * 3}s`,
                width: `${16 + (i % 3) * 8}px`,
                height: `${16 + (i % 3) * 8}px`,
              }}
            />
          ))}
        </div>

        {/* Corner botanical decorations */}
        <CornerDecoration position="top-left" />
        <CornerDecoration position="top-right" />
        <CornerDecoration position="bottom-left" />
        <CornerDecoration position="bottom-right" />

        {/* Main content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
          {/* Small brand identifier */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/70 text-sm tracking-widest uppercase">
              <Leaf className="h-3.5 w-3.5" />
              {SITE_NAME}
            </span>
          </div>

          {/* Tamil slogan — the centerpiece */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight">
              {BRAND_SLOGAN}
            </h1>
          </div>

          {/* English subtitle */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
            <p className="text-lg md:text-xl text-white/60 italic font-light tracking-wide">
              — {BRAND_SLOGAN_EN} —
            </p>
          </div>

          {/* Decorative leaf divider */}
          <div className="animate-fade-in-up flex items-center justify-center gap-4" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/30" />
            <Leaf className="h-4 w-4 text-white/40 animate-sway" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/30" />
          </div>

          {/* Brand tagline */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.7s", animationFillMode: "both" }}>
            <p className="text-base md:text-lg text-white/50 tracking-wide">
              {BRAND_TAGLINE}
            </p>
          </div>

          {/* CTA button */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.9s", animationFillMode: "both" }}>
            <Button
              size="lg"
              asChild
              className="mt-4 eco-btn-gradient text-white border-0 px-8 py-6 text-base rounded-full gap-2 group"
            >
              <Link href="/products">
                <Leaf className="h-4 w-4 transition-transform group-hover:rotate-12" />
                Explore Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
    );
  }

  /* ══════════════════════════════════════════════════
     BANNER CAROUSEL — Eco-themed overlay
     ══════════════════════════════════════════════════ */
  return (
    <section className="relative h-[50vh] md:h-[70vh] overflow-hidden group">
      {/* Brand slogan overlay on top-left of the banners */}
      <div className="absolute top-6 left-6 z-20 flex flex-col items-start gap-1 pointer-events-none md:top-8 md:left-8">
        <span className="text-xs md:text-sm font-semibold tracking-wider text-white drop-shadow-md bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 animate-fade-in">
          <Leaf className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>{BRAND_SLOGAN}</span>
          <span className="text-[10px] opacity-40">|</span>
          <span className="text-[10px] text-white/80 italic font-light tracking-normal">{BRAND_SLOGAN_EN}</span>
        </span>
      </div>

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
          {/* Eco-themed gradient overlay */}
          <div className="absolute inset-0 hero-gradient" />

          {/* Corner decorations */}
          <CornerDecoration position="top-left" />
          <CornerDecoration position="bottom-right" />

          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-xl space-y-4 animate-fade-in">
                <span className="inline-flex items-center gap-1.5 text-white/60 text-sm tracking-wider uppercase">
                  <Leaf className="h-3.5 w-3.5" />
                  {SITE_NAME}
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-lg md:text-xl text-white/80">
                    {banner.subtitle}
                  </p>
                )}
                {banner.link_url && (
                  <Button
                    size="lg"
                    asChild
                    className="mt-2 eco-btn-gradient text-white border-0 rounded-full gap-2 group"
                  >
                    <Link href={banner.link_url}>
                      Shop Now
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows — eco styled */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === current
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
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
