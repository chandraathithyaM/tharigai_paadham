import { getAllCategories, createCategory, deleteCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Grid, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  // Server actions for CRUD
  async function handleCreateCategory(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const sort_order = parseInt(formData.get("sort_order") as string) || 0;
    const is_active = formData.get("is_active") === "true";

    if (!name) return;

    await createCategory({
      name,
      slug: slugify(name),
      description: description || undefined,
      sort_order,
      is_active,
    });

    revalidatePath("/admin/categories");
    redirect("/admin/categories");
  }

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
                        <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
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
              <form action={handleCreateCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input id="name" name="name" required placeholder="e.g. Sneakers" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Description of category..." rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input id="sort_order" name="sort_order" type="number" defaultValue={0} />
                </div>

                <div className="flex items-center justify-between border p-3 rounded-xl bg-muted/20">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">Active Category</Label>
                    <p className="text-[10px] text-muted-foreground">Visible in collections.</p>
                  </div>
                  {/* Since simple HTML forms do not submit switches natively, we'll use a hidden input pattern or checkbox */}
                  <input type="checkbox" id="is_active" name="is_active" value="true" defaultChecked className="h-4 w-4 accent-primary rounded cursor-pointer" />
                </div>

                <Button type="submit" className="w-full rounded-full font-semibold gap-1.5 mt-2">
                  <Plus className="h-4 w-4" /> Create Category
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
