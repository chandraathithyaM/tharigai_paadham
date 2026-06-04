export const SITE_NAME = "Tharigai Paadham Footwear";
export const SITE_DESCRIPTION =
  "Premium footwear collection - Sneakers, Crocs, Slides, Formal Shoes, Casual Shoes, Running Shoes & more. Shop online with free shipping.";

export const WHATSAPP_NUMBER = "+919688822826";
export const WHATSAPP_MESSAGE =
  "Hello, I'm interested in your footwear collection.";
export const INSTAGRAM_HANDLE = "tharigai_paadham_puliampatti";

export const PRODUCT_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Popular", value: "popular" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
] as const;

export const GENDER_OPTIONS = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
  { label: "Unisex", value: "unisex" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export const BRANDS = [
  "Nike",
  "Adidas",
  "Puma",
  "Reebok",
  "New Balance",
  "Crocs",
  "Skechers",
  "Woodland",
  "Bata",
  "Clarks",
  "Red Tape",
  "Campus",
  "Sparx",
  "Liberty",
  "Metro",
  "Hush Puppies",
] as const;

export const SIZES = {
  men: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
  women: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
  kids: ["UK 1", "UK 2", "UK 3", "UK 4", "UK 5"],
  unisex: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Men", href: "/products?gender=men", hasDropdown: true, gender: "men" },
  { label: "Women", href: "/products?gender=women", hasDropdown: true, gender: "women" },
  { label: "Kids", href: "/products?gender=kids", hasDropdown: true, gender: "kids" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Best Sellers", href: "/products?sort=popular" },
] as const;

export const ITEMS_PER_PAGE = 12;
