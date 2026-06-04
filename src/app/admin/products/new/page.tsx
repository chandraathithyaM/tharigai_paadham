import { getAllCategories } from "@/actions/categories";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return (
    <ProductForm
      categories={categories}
      title="Create Product"
    />
  );
}
