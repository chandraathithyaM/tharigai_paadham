import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllCategories } from "@/actions/categories";
import { updateProductWithDetails } from "@/actions/products";
import { ProductForm } from "@/components/admin/product-form";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const categories = await getAllCategories();

  // Fetch product with details
  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `*, category:categories(*), images:product_images(*), sizes:product_sizes(*), colors:product_colors(*)`
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Server action to update the product from the form
  async function handleSubmit(data: any) {
    "use server";
    await updateProductWithDetails(id, data);
  }

  return (
    <ProductForm
      categories={categories}
      initialData={product}
      onSubmit={handleSubmit}
      title="Edit Product"
    />
  );
}
