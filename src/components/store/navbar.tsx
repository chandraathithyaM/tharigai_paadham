"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  SignInButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
} from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface NavbarProps {
  categories?: Category[];
}

export function Navbar({ categories = [] }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveQuery(window.location.search);
    }
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    ...categories.map((cat) => ({
      label: cat.name,
      href: `/products?category=${cat.slug}`,
    })),
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Best Sellers", href: "/products?sort=popular" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetTitle className="text-lg font-bold">{SITE_NAME}</SheetTitle>
            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => {
                const isLinkActive = link.href.includes("?")
                  ? pathname === link.href.split("?")[0] && activeQuery.includes(link.href.split("?")[1])
                  : pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-primary py-1",
                      isLinkActive
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
        >
          <span className="hidden sm:inline gradient-text">
            {SITE_NAME}
          </span>
          <span className="sm:hidden gradient-text">TP</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isLinkActive = link.href.includes("?")
              ? pathname === link.href.split("?")[0] && activeQuery.includes(link.href.split("?")[1])
              : pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative",
                  isLinkActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
                {isLinkActive && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary animate-in fade-in" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="Search products">
            <Link href="/search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild aria-label="Instagram">
            <a
              href="https://instagram.com/tharigai_paadham_puliampatti"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          </Button>

          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative" asChild aria-label="Wishlist">
            <Link href="/wishlist">
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  {wishlistCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="relative" asChild aria-label="Cart">
            <Link href="/cart">
              <ShoppingBag className="h-4 w-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Show when="signed-out">
            <SignInButton>
              <Button variant="outline" size="sm" className="ml-2">
                Sign In
              </Button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <div className="ml-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
