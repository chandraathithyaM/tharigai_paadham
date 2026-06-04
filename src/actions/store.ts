"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Banner, Coupon, StoreSettings } from "@/types";
import { revalidatePath } from "next/cache";
import { generateOrderNumber } from "@/lib/utils";

// ---- BANNERS ----
export async function getBanners(): Promise<Banner[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function getAllBanners(): Promise<Banner[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });
  return data || [];
}

export async function createBanner(bannerData: Omit<Banner, "id" | "created_at">) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("banners").insert(bannerData).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/banners");
  return data;
}

export async function updateBanner(id: string, bannerData: Partial<Banner>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("banners").update(bannerData).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/banners");
  return data;
}

export async function deleteBanner(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/banners");
}

// ---- COUPONS ----
export async function getCoupons(): Promise<Coupon[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function validateCoupon(code: string, orderTotal: number): Promise<Coupon | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (!data) return null;

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  // Check usage limit
  if (data.usage_limit && data.used_count >= data.usage_limit) return null;

  // Check minimum order amount
  if (orderTotal < data.min_order_amount) return null;

  return data;
}

export async function createCoupon(couponData: Omit<Coupon, "id" | "created_at" | "used_count">) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("coupons").insert(couponData).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
  return data;
}

export async function updateCoupon(id: string, couponData: Partial<Coupon>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("coupons").update(couponData).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
  return data;
}

export async function deleteCoupon(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
}

// ---- STORE SETTINGS ----
export async function getStoreSettings(): Promise<StoreSettings | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("store_settings").select("*").limit(1).single();
  return data as StoreSettings | null;
}

export async function updateStoreSettings(settings: Partial<StoreSettings>) {
  const supabase = createAdminClient();
  const { data: existing } = await supabase.from("store_settings").select("id").limit(1).single();

  if (existing) {
    const { data, error } = await supabase
      .from("store_settings")
      .update(settings)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return data;
  } else {
    const { data, error } = await supabase
      .from("store_settings")
      .insert(settings)
      .select()
      .single();
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return data;
  }
}

// ---- NEWSLETTER ----
export async function subscribeNewsletter(email: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email, is_active: true }, { onConflict: "email" });
  if (error) throw new Error(error.message);
  return { success: true };
}

// ---- REVIEWS ----
export async function getProductReviews(productId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, user:users(full_name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function createReview(reviewData: {
  user_id: string;
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("reviews").insert(reviewData).select().single();
  if (error) throw new Error(error.message);

  // Update product avg_rating and review_count
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", reviewData.product_id);

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await supabase
      .from("products")
      .update({ avg_rating: Math.round(avgRating * 10) / 10, review_count: reviews.length })
      .eq("id", reviewData.product_id);
  }

  return data;
}

// ---- ORDERS ----
export async function getOrders(userId?: string) {
  const supabase = createAdminClient();

  let query = supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data } = await query;
  return data || [];
}

export async function getOrderById(orderId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*), user:users(full_name, email)")
    .eq("id", orderId)
    .single();
  return data;
}

export async function createOrder(orderData: {
  user_id: string | null;
  shipping_address: any;
  coupon_code?: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  items: {
    product_id: string;
    product_name: string;
    product_image: string | null;
    size: string;
    color: string | null;
    quantity: number;
    price: number;
  }[];
  notes?: string;
}) {
  const supabase = createAdminClient();
  const orderNumber = generateOrderNumber();

  // 1. Resolve coupon_id if code is provided
  let coupon_id = null;
  if (orderData.coupon_code) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", orderData.coupon_code.toUpperCase())
      .single();
    if (coupon) {
      coupon_id = coupon.id;
    }
  }

  // 2. Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: orderData.user_id,
      coupon_id,
      subtotal: orderData.subtotal,
      discount_amount: orderData.discount_amount,
      shipping_amount: orderData.shipping_amount,
      total: orderData.total,
      shipping_address: orderData.shipping_address,
      status: "pending",
      payment_method: "razorpay",
      payment_status: "pending",
      notes: orderData.notes,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Order creation database error:", orderError);
    throw new Error(orderError?.message || "Failed to create order");
  }

  // 3. Insert order items
  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_image: item.product_image,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    console.error("Order items database error:", itemsError);
    throw new Error(itemsError.message);
  }

  // 4. Update coupon used_count if coupon is applied
  if (coupon_id) {
    const { data: couponData } = await supabase
      .from("coupons")
      .select("used_count")
      .eq("id", coupon_id)
      .single();
    
    if (couponData) {
      await supabase
        .from("coupons")
        .update({ used_count: couponData.used_count + 1 })
        .eq("id", coupon_id);
    }
  }

  // 5. Update stock & create inventory logs for each item
  for (const item of orderData.items) {
    const { data: sizeData } = await supabase
      .from("product_sizes")
      .select("id, stock")
      .eq("product_id", item.product_id)
      .eq("size", item.size)
      .single();

    if (sizeData) {
      const newStock = Math.max(0, sizeData.stock - item.quantity);
      await supabase
        .from("product_sizes")
        .update({ stock: newStock })
        .eq("id", sizeData.id);

      await supabase.from("inventory_logs").insert({
        product_id: item.product_id,
        size: item.size,
        previous_stock: sizeData.stock,
        new_stock: newStock,
        change_type: "sale",
        notes: `Sold via order ${orderNumber}`,
      });
    }

    const { data: productData } = await supabase
      .from("products")
      .select("total_sold")
      .eq("id", item.product_id)
      .single();
    if (productData) {
      await supabase
        .from("products")
        .update({ total_sold: (productData.total_sold || 0) + item.quantity })
        .eq("id", item.product_id);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  return order;
}


export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

// ---- ANALYTICS ----
export async function getDashboardStats() {
  const supabase = createAdminClient();

  const [
    { data: orders },
    { count: totalProducts },
    { count: totalCustomers },
  ] = await Promise.all([
    supabase.from("orders").select("total, status, payment_status"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "customer"),
  ]);

  const paidOrders = (orders || []).filter((o) => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  // Low stock products
  const { data: lowStockSizes } = await supabase
    .from("product_sizes")
    .select("product_id")
    .lte("stock", 5);
  const lowStockIds = new Set((lowStockSizes || []).map((s) => s.product_id));

  return {
    totalRevenue,
    totalOrders: (orders || []).length,
    totalProducts: totalProducts || 0,
    totalCustomers: totalCustomers || 0,
    lowStockProducts: lowStockIds.size,
    revenueChange: 12.5,
    ordersChange: 8.2,
  };
}

export async function getMonthlySales() {
  const supabase = createAdminClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data } = await supabase
    .from("orders")
    .select("total, created_at")
    .eq("payment_status", "paid")
    .gte("created_at", sixMonthsAgo.toISOString());

  // Group by month
  const monthlyData: Record<string, { revenue: number; orders: number }> = {};
  (data || []).forEach((order) => {
    const month = new Date(order.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    if (!monthlyData[month]) monthlyData[month] = { revenue: 0, orders: 0 };
    monthlyData[month].revenue += Number(order.total);
    monthlyData[month].orders += 1;
  });

  return Object.entries(monthlyData).map(([date, data]) => ({
    date,
    ...data,
  }));
}

// ---- ADDRESSES ----
export async function getUserAddresses(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });
  return data || [];
}

export async function createAddress(addressData: {
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}) {
  const supabase = createAdminClient();

  // If setting as default, unset other defaults
  if (addressData.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", addressData.user_id);
  }

  const { data, error } = await supabase.from("addresses").insert(addressData).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAddress(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- CUSTOMERS (Admin) ----
export async function getCustomers() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function toggleBlockUser(userId: string, isBlocked: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ is_blocked: isBlocked })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/customers");
}

export async function getUserByClerkId(clerkId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();
  if (error || !data) return null;
  return data;
}

