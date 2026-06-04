"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  X,
  ChevronDown,
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
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface NavbarProps {
  categories?: Category[];
}

export function Navbar({ categories = [] }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredGender, setHoveredGender] = useState<string | null>(null);
  const [expandedMobileGender, setExpandedMobileGender] = useState<string | null>(null);
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const toggleMobileGender = (gender: string) => {
    setExpandedMobileGender(expandedMobileGender === gender ? null : gender);
  };

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
              {NAV_LINKS.map((link) => {
                const hasDropdown = 'hasDropdown' in link && link.hasDropdown;
                const gender = 'gender' in link ? link.gender : '';
                
                if (hasDropdown && gender) {
                  const isExpanded = expandedMobileGender === gender;
                  return (
                    <div key={link.href} className="space-y-2">
                      <button
                        onClick={() => toggleMobileGender(gender)}
                        className={cn(
                          "w-full flex items-center justify-between text-base font-medium transition-colors hover:text-primary py-1",
                          isExpanded ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        <span>{link.label}</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-250", isExpanded ? "rotate-180" : "")} />
                      </button>
                      
                      {isExpanded && (
                        <div className="pl-4 flex flex-col gap-2 border-l-2 ml-1 border-primary/20 animate-in slide-in-from-top-1 duration-200">
                          <Link
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                          >
                            Shop All {link.label}&apos;s Footwear
                          </Link>
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/products?category=${cat.slug}&gender=${gender}`}
                              onClick={() => setIsOpen(false)}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-primary py-1",
                      pathname === link.href
                        ? "text-primary"
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
          {NAV_LINKS.map((link) => {
            const hasDropdown = 'hasDropdown' in link && link.hasDropdown;
            const gender = 'gender' in link ? link.gender : '';

            if (hasDropdown && gender) {
              const isHovered = hoveredGender === gender;
              return (
                <div
                  key={link.href}
                  className="relative py-5"
                  onMouseEnter={() => setHoveredGender(gender)}
                  onMouseLeave={() => setHoveredGender(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                      pathname === link.href || (pathname.startsWith("/products") && pathname.includes(`gender=${gender}`))
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn("h-3.5 w-3.5 opacity-60 transition-transform duration-200", isHovered ? "rotate-180" : "")} />
                  </Link>
                  {pathname === link.href && (
                    <span className="absolute -bottom-[0.5px] left-0 right-0 h-0.5 bg-primary animate-in fade-in" />
                  )}

                  {/* Dropdown panel */}
                  {isHovered && (
                    <div className="absolute top-[52px] left-0 mt-1 w-56 rounded-xl border bg-popover/95 backdrop-blur-md p-2 text-popover-foreground shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      <div className="space-y-1">
                        <Link
                          href={link.href}
                          className="block px-3 py-2 text-xs font-semibold hover:bg-accent rounded-lg transition-colors"
                          onClick={() => setHoveredGender(null)}
                        >
                          Shop All {link.label}&apos;s Footwear
                        </Link>
                        <div className="-mx-2 my-1 h-px bg-muted" />
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/products?category=${cat.slug}&gender=${gender}`}
                            className="block px-3 py-2 text-xs hover:bg-accent hover:text-foreground rounded-lg transition-colors font-medium text-muted-foreground"
                            onClick={() => setHoveredGender(null)}
                          >
                            {link.label}&apos;s {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary" />
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
