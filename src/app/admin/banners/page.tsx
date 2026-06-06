import { getAllBanners, deleteBanner } from "@/actions/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageIcon, Trash2, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BannerForm } from "@/components/admin/banner-form";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminBannersPage() {
  const banners = await getAllBanners();



  async function handleDeleteBanner(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deleteBanner(id);
      revalidatePath("/admin/banners");
      redirect("/admin/banners");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <ImageIcon className="h-8 w-8 text-primary" /> Banners Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Add, list, or delete homepage hero carousel slide banners.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Banners list */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Carousel Slides</CardTitle>
              <CardDescription>All defined homepage slides.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 font-medium text-muted-foreground border-b text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Preview</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Sort Order</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {banners.length > 0 ? (
                      banners.map((banner) => (
                        <tr key={banner.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div className="relative h-12 w-24 rounded border overflow-hidden shrink-0 bg-muted/20">
                              <img src={banner.image_url} alt={banner.title} className="object-cover h-full w-full" />
                            </div>
                          </td>
                          <td className="p-4 text-xs font-semibold text-foreground">
                            <p className="font-bold">{banner.title}</p>
                            {banner.subtitle && <p className="text-[10px] text-muted-foreground font-normal">{banner.subtitle}</p>}
                            {banner.link_url && (
                              <p className="text-[10px] text-primary font-normal flex items-center gap-1 mt-1 font-mono">
                                <LinkIcon className="h-2.5 w-2.5" /> {banner.link_url}
                              </p>
                            )}
                          </td>
                          <td className="p-4 text-xs font-semibold">
                            {banner.sort_order}
                          </td>
                          <td className="p-4">
                            <Badge variant={banner.is_active ? "default" : "secondary"} className="text-[10px]">
                              {banner.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <form action={handleDeleteBanner}>
                              <input type="hidden" name="id" value={banner.id} />
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
                          No banner slides configured yet. Add your first slide on the right panel!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Add banner form */}
        <div>
          <Card className="border shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-base font-bold">New Slide</CardTitle>
              <CardDescription>Configure a new hero slide banner.</CardDescription>
            </CardHeader>
            <CardContent>
              <BannerForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
