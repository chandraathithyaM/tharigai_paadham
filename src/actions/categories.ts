"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Category } from "@/types";
import { revalidatePath } from "next/cache";

export async function getCategories(): Promise<Category[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data;
}

export async function createCategory(formData: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string | null;
  is_active?: boolean;
  sort_order?: number;
}) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .insert(formData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return data;
}

export async function updateCategory(
  id: string,
  formData: Partial<Category>
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return data;
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
