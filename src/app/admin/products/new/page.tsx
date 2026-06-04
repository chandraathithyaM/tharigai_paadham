import { getAllCategories } from "@/actions/categories";
import { createProductWithDetails } from "@/actions/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getAllCategories();

  // Server action to create a product from the form
  async function handleSubmit(data: any) {
    "use server";
    await createProductWithDetails(data);
  }

  return (
    <ProductForm
      categories={categories}
      onSubmit={handleSubmit}
      title="Create Product"
    />
  );
}
