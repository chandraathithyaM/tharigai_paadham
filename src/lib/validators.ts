import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  category_id: z.string().uuid("Select a valid category").optional(),
  price: z.coerce.number().positive("Price must be positive"),
  discount_price: z.coerce.number().positive().optional().nullable(),
  gender: z.enum(["men", "women", "kids", "unisex"]).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  parent_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.coerce.number().positive("Discount must be positive"),
  min_order_amount: z.coerce.number().min(0).default(0),
  max_discount_amount: z.coerce.number().positive().optional().nullable(),
  usage_limit: z.coerce.number().int().positive().optional().nullable(),
  is_active: z.boolean().default(true),
  expires_at: z.string().optional().nullable(),
});

export type CouponFormValues = z.infer<typeof couponSchema>;

export const addressSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  is_default: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Review must be at least 10 characters").optional(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

export const bannerSchema = z.object({
  title: z.string().min(2, "Title is required"),
  subtitle: z.string().optional(),
  image_url: z.string().url("Enter a valid URL"),
  link_url: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;

export const storeSettingsSchema = z.object({
  store_name: z.string().min(2, "Store name is required"),
  whatsapp_number: z.string().min(10, "Enter a valid number"),
  instagram_url: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  google_maps_url: z.string().optional(),
  facebook_url: z.string().optional(),
  twitter_url: z.string().optional(),
  youtube_url: z.string().optional(),
  shipping_fee: z.coerce.number().min(0).default(0),
  free_shipping_threshold: z.coerce.number().min(0).default(999),
});

export type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
