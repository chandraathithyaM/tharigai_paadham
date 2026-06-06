import { getAllCategories, deleteCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Grid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  async function handleDeleteCategory(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deleteCategory(id);
      revalidatePath("/admin/categories");
      redirect("/admin/categories");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Grid className="h-8 w-8 text-primary" /> Categories Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Add, list, or delete categories inside the footwear store catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Categories list */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Category List</CardTitle>
              <CardDescription>All catalog category hierarchies.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 font-medium text-muted-foreground border-b text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 w-16">Preview</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Order</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div className="relative h-10 w-10 rounded-md border overflow-hidden shrink-0 bg-muted/20 flex items-center justify-center">
                              {cat.image_url ? (
                                <img src={cat.image_url} alt={cat.name} className="object-cover h-full w-full" />
                              ) : (
                                <Grid className="h-4 w-4 text-muted-foreground/30" />
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-xs text-foreground">
                            {cat.name}
                          </td>
                          <td className="p-4 font-mono text-xs text-muted-foreground">
                            {cat.slug}
                          </td>
                          <td className="p-4 text-xs font-semibold">
                            {cat.sort_order}
                          </td>
                          <td className="p-4">
                            <Badge variant={cat.is_active ? "default" : "secondary"} className="text-[10px]">
                              {cat.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <form action={handleDeleteCategory}>
                              <input type="hidden" name="id" value={cat.id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                          No categories defined yet. Add your first category!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Add category form */}
        <div>
          <Card className="border shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-base font-bold">New Category</CardTitle>
              <CardDescription>Define a new classification tag.</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
