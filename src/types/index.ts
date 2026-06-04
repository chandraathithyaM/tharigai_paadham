/* ============================================
 * Tharigai Paadham - TypeScript Database Types
 * ============================================ */

// ---- Core Database Row Types ----

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: "customer" | "admin";
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  category_id: string | null;
  price: number;
  discount_price: number | null;
  gender: "men" | "women" | "kids" | "unisex" | null;
  is_featured: boolean;
  is_active: boolean;
  total_sold: number;
  avg_rating: number;
  review_count: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  stock: number;
}

export interface ProductColor {
  id: string;
  product_id: string;
  name: string;
  hex_code: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  size: string;
  color: string | null;
  quantity: number;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  address_id: string | null;
  coupon_id: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  status: OrderStatus;
  payment_method: string;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  shipping_address: ShippingAddress | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string;
  color: string | null;
  quantity: number;
  price: number;
  total: number;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  size: string;
  previous_stock: number;
  new_stock: number;
  change_type: "restock" | "sale" | "adjustment" | "return";
  notes: string | null;
  created_at: string;
}

export interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  whatsapp_number: string;
  instagram_url: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  business_hours: BusinessHours;
  google_maps_url: string;
  facebook_url: string;
  twitter_url: string;
  youtube_url: string;
  shipping_fee: number;
  free_shipping_threshold: number;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

// ---- Extended / Joined Types ----

export interface ProductWithDetails extends Product {
  category: Category | null;
  images: ProductImage[];
  sizes: ProductSize[];
  colors: ProductColor[];
}

export interface CartItemWithProduct extends CartItem {
  product: Product & {
    images: ProductImage[];
  };
}

export interface WishlistItemWithProduct extends WishlistItem {
  product: Product & {
    images: ProductImage[];
  };
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  user?: User | null;
}

export interface ReviewWithUser extends Review {
  user: Pick<User, "full_name" | "avatar_url">;
}

// ---- API / Query Types ----

export interface ProductFilters {
  category?: string;
  gender?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  search?: string;
  sort?: "newest" | "popular" | "price-asc" | "price-desc";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: number;
  revenueChange: number;
  ordersChange: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  total_sold: number;
  revenue: number;
  image: string;
}

export interface TopCategory {
  name: string;
  count: number;
  revenue: number;
}
