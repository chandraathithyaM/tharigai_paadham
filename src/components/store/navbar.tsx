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
  Shield,
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

function LeafIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
    </svg>
  );
}

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface NavbarProps {
  categories?: Category[];
  isAdmin?: boolean;
}

export function Navbar({ categories = [], isAdmin = false }: NavbarProps) {
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
      href: `/categories/${cat.slug}`,
    })),
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Best Sellers", href: "/best-sellers" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            {/* Botanical decoration */}
            <div className="absolute top-0 left-0 right-0 h-32 opacity-10 overflow-hidden pointer-events-none">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 300 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
              >
                <path
                  d="M50 80C50 80 70 40 120 30C170 20 180 60 180 60"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
                <path
                  d="M120 30C120 30 100 10 130 5C160 0 150 30 150 30"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="currentColor"
                  fillOpacity="0.1"
                />
                <path
                  d="M140 45C140 45 160 20 180 25C200 30 175 50 175 50"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="currentColor"
                  fillOpacity="0.1"
                />
                <path
                  d="M80 60C80 60 60 35 85 25C110 15 100 50 100 50"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="currentColor"
                  fillOpacity="0.1"
                />
                <path
                  d="M200 70C200 70 220 30 270 25C270 25 250 50 230 60C210 70 200 70 200 70"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="currentColor"
                  fillOpacity="0.08"
                />
              </svg>
            </div>
            <SheetTitle className="text-lg font-bold gradient-text flex items-center gap-2">
              <LeafIcon />
              {SITE_NAME}
            </SheetTitle>
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
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-base font-semibold text-primary hover:text-primary/80 py-2 mt-4 border-t border-border pt-4"
                >
                  <Shield className="h-4 w-4 text-primary" />
                  Admin Console
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
        >
          <LeafIcon />
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
                  <span className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
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

          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden md:flex ml-2 border-primary/30 hover:border-primary text-xs font-semibold gap-1.5 rounded-full hover:bg-primary/5 transition-colors"
            >
              <Link href="/admin">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Admin Console</span>
              </Link>
            </Button>
          )}

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
