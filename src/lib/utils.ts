import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDiscountPercentage(
  price: number,
  discountPrice: number | null
): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function getProductPrice(product: {
  price: number;
  discount_price: number | null;
}): number {
  return product.discount_price ?? product.price;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `TP-${dateStr}-${rand}`;
}

export function getStockStatus(
  sizes: { stock: number }[]
): "in_stock" | "low_stock" | "out_of_stock" {
  const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);
  if (totalStock === 0) return "out_of_stock";
  if (totalStock <= 5) return "low_stock";
  return "in_stock";
}

export function getWhatsAppUrl(
  number: string,
  message: string = "Hello, I'm interested in your footwear collection."
): string {
  const cleanNumber = number.replace(/[^\d+]/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function getInstagramUrl(handle: string): string {
  const cleanHandle = handle.replace("@", "");
  return `https://instagram.com/${cleanHandle}`;
}

export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${path}`;
}
