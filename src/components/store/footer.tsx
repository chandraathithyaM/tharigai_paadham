"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SITE_NAME, BRAND_TAGLINE, BRAND_SLOGAN } from "@/lib/constants";
import { useState } from "react";
import { toast } from "sonner";

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

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { subscribeNewsletter } = await import("@/actions/store");
      await subscribeNewsletter(email);
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="eco-footer border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3
              className="text-lg font-bold"
              style={{ color: "#d4a853" }}
            >
              {SITE_NAME}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed italic">
              {BRAND_TAGLINE}
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              Eco-conscious footwear rooted in Tamil heritage. We walk gently on
              earth — {BRAND_SLOGAN}.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/tharigai_paadham_puliampatti"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <InstagramIcon className="h-4 w-4 text-white/90" />
              </a>
              <a
                href="https://wa.me/919688822826?text=Hello%2C%20I%27m%20interested%20in%20your%20footwear%20collection."
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Chat on WhatsApp"
              >
                <Phone className="h-4 w-4 text-green-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Shop
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "New Arrivals", href: "/new-arrivals" },
                { label: "Best Sellers", href: "/best-sellers" },
                { label: "Men", href: "/products?gender=men" },
                { label: "Women", href: "/products?gender=women" },
                { label: "Kids", href: "/products?gender=kids" },
                { label: "All Products", href: "/products" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Contact
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+91 96888 22826</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <InstagramIcon className="h-4 w-4 shrink-0" />
                <span>@tharigai_paadham_puliampatti</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Puliampatti, Tamil Nadu</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Mon-Sat: 9AM - 9PM</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Newsletter
            </h4>
            <p className="text-sm text-white/60">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                required
                aria-label="Email for newsletter"
              />
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="bg-white/90 text-green-900 hover:bg-white"
              >
                {loading ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Leaf divider */}
        <div className="leaf-divider my-8">
          <span className="text-white/30">🌿</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link href="/products" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/products" className="hover:text-white/70 transition-colors">
              Terms of Service
            </Link>
            <Link href="/products" className="hover:text-white/70 transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
