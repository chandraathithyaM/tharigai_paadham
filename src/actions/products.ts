"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductFilters, PaginatedResponse, ProductWithDetails } from "@/types";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function getProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<ProductWithDetails>> {
  const supabase = createAdminClient();
  const page = filters.page || 1;
  const limit = filters.limit || ITEMS_PER_PAGE;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select(
      `*, category:categories(*), images:product_images(*), sizes:product_sizes(*), colors:product_colors(*)`,
      { count: "exact" }
    )
    .eq("is_active", true);

  // Apply filters
  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  if (filters.gender) {
    query = query.eq("gender", filters.gender);
  }

  if (filters.brand) {
    query = query.eq("brand", filters.brand);
  }

  if (filters.minPrice) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Apply sorting
  switch (filters.sort) {
    case "popular":
      query = query.order("total_sold", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  return {
    data: (data || []) as unknown as ProductWithDetails[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithDetails | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `*, category:categories(*), images:product_images(*), sizes:product_sizes(*), colors:product_colors(*)`
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .order("sort_order", { referencedTable: "product_images", ascending: true })
    .order("size", { referencedTable: "product_sizes", ascending: true })
    .single();

  if (error || !data) return null;
  return data as unknown as ProductWithDetails;
}

export async function getFeaturedProducts(): Promise<ProductWithDetails[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("products")
    .select(
      `*, category:categories(*), images:product_images(*), sizes:product_sizes(*), colors:product_colors(*)`
    )
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  return (data || []) as unknown as ProductWithDetails[];
}

export async function getNewArrivals(): Promise<ProductWithDetails[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("products")
    .select(
      `*, category:categories(*), images:product_images(*), sizes:product_sizes(*), colors:product_colors(*)`
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(30);

  return (data || []) as unknown as ProductWithDetails[];
}

export async function getBestSellers(): Promise<ProductWithDetails[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("products")
    .select(
      `*, category:categories(*), images:product_images(*), sizes:product_sizes(*), colors:product_colors(*)`
    )
    .eq("is_active", true)
    .order("total_sold", { ascending: false })
    .limit(8);

  return (data || []) as unknown as ProductWithDetails[];
}

export async function getProductsByGender(
  gender: string
): Promise<ProductWithDetails[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("products")
    .select(
      `*, category:categories(*), images:product_images(*), sizes:product_sizes(*), colors:product_colors(*)`
    )
    .eq("is_active", true)
    .or(`gender.eq.${gender},gender.eq.unisex`)
    .order("total_sold", { ascending: false })
    .limit(8);

  return (data || []) as unknown as ProductWithDetails[];
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null
): Promise<ProductWithDetails[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("products")
    .select(
      `*, category:categories(*), images:product_images(*), sizes:product_sizes(*), colors:product_colors(*)`
    )
    .eq("is_active", true)
    .neq("id", productId)
    .limit(4);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query;
  return (data || []) as unknown as ProductWithDetails[];
}

// ---- Admin Product Actions ----

export async function createProduct(formData: FormData) {
  const supabase = createAdminClient();

  const product = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    brand: formData.get("brand") as string,
    category_id: formData.get("category_id") as string || null,
    price: parseFloat(formData.get("price") as string),
    discount_price: formData.get("discount_price")
      ? parseFloat(formData.get("discount_price") as string)
      : null,
    gender: formData.get("gender") as string || null,
    is_featured: formData.get("is_featured") === "true",
    is_active: formData.get("is_active") !== "false",
    meta_title: formData.get("meta_title") as string,
    meta_description: formData.get("meta_description") as string,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const product = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    brand: formData.get("brand") as string,
    category_id: formData.get("category_id") as string || null,
    price: parseFloat(formData.get("price") as string),
    discount_price: formData.get("discount_price")
      ? parseFloat(formData.get("discount_price") as string)
      : null,
    gender: formData.get("gender") as string || null,
    is_featured: formData.get("is_featured") === "true",
    is_active: formData.get("is_active") !== "false",
    meta_title: formData.get("meta_title") as string,
    meta_description: formData.get("meta_description") as string,
  };

  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getAllProductsAdmin() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `*, category:categories(name), images:product_images(*), sizes:product_sizes(*)`
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createProductWithDetails(data: {
  product: {
    name: string;
    slug: string;
    description?: string;
    brand?: string;
    category_id?: string | null;
    price: number;
    discount_price?: number | null;
    gender?: "men" | "women" | "kids" | "unisex" | null;
    is_featured?: boolean;
    is_active?: boolean;
    meta_title?: string;
    meta_description?: string;
  };
  images: { url: string; is_primary: boolean }[];
  sizes: { size: string; stock: number }[];
  colors: { name: string; hex_code: string }[];
}) {
  const supabase = createAdminClient();

  // 1. Insert product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert(data.product)
    .select()
    .single();

  if (productError || !product) {
    throw new Error(productError?.message || "Failed to create product");
  }

  const productId = product.id;

  // 2. Insert images
  if (data.images && data.images.length > 0) {
    const imagesToInsert = data.images.map((img) => ({
      product_id: productId,
      url: img.url,
      is_primary: img.is_primary,
    }));
    const { error: imgError } = await supabase.from("product_images").insert(imagesToInsert);
    if (imgError) throw new Error(imgError.message);
  }

  // 3. Insert sizes
  if (data.sizes && data.sizes.length > 0) {
    const sizesToInsert = data.sizes.map((s) => ({
      product_id: productId,
      size: s.size,
      stock: s.stock,
    }));
    const { error: sizeError } = await supabase.from("product_sizes").insert(sizesToInsert);
    if (sizeError) throw new Error(sizeError.message);
  }

  // 4. Insert colors
  if (data.colors && data.colors.length > 0) {
    const colorsToInsert = data.colors.map((c) => ({
      product_id: productId,
      name: c.name,
      hex_code: c.hex_code,
    }));
    const { error: colorError } = await supabase.from("product_colors").insert(colorsToInsert);
    if (colorError) throw new Error(colorError.message);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return product;
}

export async function updateProductWithDetails(
  id: string,
  data: {
    product: {
      name: string;
      slug: string;
      description?: string;
      brand?: string;
      category_id?: string | null;
      price: number;
      discount_price?: number | null;
      gender?: "men" | "women" | "kids" | "unisex" | null;
      is_featured?: boolean;
      is_active?: boolean;
      meta_title?: string;
      meta_description?: string;
    };
    images: { url: string; is_primary: boolean }[];
    sizes: { size: string; stock: number }[];
    colors: { name: string; hex_code: string }[];
  }
) {
  const supabase = createAdminClient();

  // 1. Update product
  const { error: productError } = await supabase
    .from("products")
    .update(data.product)
    .eq("id", id);

  if (productError) {
    throw new Error(productError.message);
  }

  // 2. Delete existing details
  await Promise.all([
    supabase.from("product_images").delete().eq("product_id", id),
    supabase.from("product_sizes").delete().eq("product_id", id),
    supabase.from("product_colors").delete().eq("product_id", id),
  ]);

  // 3. Insert details
  if (data.images && data.images.length > 0) {
    const imagesToInsert = data.images.map((img) => ({
      product_id: id,
      url: img.url,
      is_primary: img.is_primary,
    }));
    const { error: imgError } = await supabase.from("product_images").insert(imagesToInsert);
    if (imgError) throw new Error(imgError.message);
  }

  if (data.sizes && data.sizes.length > 0) {
    const sizesToInsert = data.sizes.map((s) => ({
      product_id: id,
      size: s.size,
      stock: s.stock,
    }));
    const { error: sizeError } = await supabase.from("product_sizes").insert(sizesToInsert);
    if (sizeError) throw new Error(sizeError.message);
  }

  if (data.colors && data.colors.length > 0) {
    const colorsToInsert = data.colors.map((c) => ({
      product_id: id,
      name: c.name,
      hex_code: c.hex_code,
    }));
    const { error: colorError } = await supabase.from("product_colors").insert(colorsToInsert);
    if (colorError) throw new Error(colorError.message);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${data.product.slug}`);
  revalidatePath("/admin/products");
}

export async function getAllInventory() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_sizes")
    .select(`*, product:products(name, brand, slug)`)
    .order("stock", { ascending: true }); // Show low stock first
  if (error) throw new Error(error.message);
  return data;
}

export async function restockProductSize(data: {
  sizeId: string;
  productId: string;
  size: string;
  newStock: number;
  previousStock: number;
  notes?: string;
}) {
  const supabase = createAdminClient();

  const { error: sizeError } = await supabase
    .from("product_sizes")
    .update({ stock: data.newStock })
    .eq("id", data.sizeId);

  if (sizeError) throw new Error(sizeError.message);

  await supabase.from("inventory_logs").insert({
    product_id: data.productId,
    size: data.size,
    previous_stock: data.previousStock,
    new_stock: data.newStock,
    change_type: "restock",
    notes: data.notes || "Quick restock from admin panel",
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
}


