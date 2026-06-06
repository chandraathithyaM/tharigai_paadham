"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import { createCategory } from "@/actions/categories";
import { createClient } from "@/lib/supabase/client";

export function CategoryForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");

  const [category, setCategory] = React.useState({
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  // Auto-slugify when name changes
  React.useEffect(() => {
    setCategory((prev) => ({ ...prev, slug: slugify(prev.name) }));
  }, [category.name]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max size is 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File is not an image.");
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const uniqueId = Math.random().toString(36).substring(2, 10);
      const fileName = `${Date.now()}-${uniqueId}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from("categories")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("categories")
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Cover photo uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category.name || !category.slug) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCategory({
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
        image_url: imageUrl || undefined,
        sort_order: Number(category.sort_order),
        is_active: category.is_active,
      });

      toast.success("Category created successfully!");
      
      // Reset form
      setCategory({
        name: "",
        slug: "",
        description: "",
        sort_order: 0,
        is_active: true,
      });
      setImageUrl("");
      
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          value={category.name}
          onChange={(e) => setCategory((prev) => ({ ...prev, name: e.target.value }))}
          required
          placeholder="e.g. Sneakers"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (Auto-generated)</Label>
        <Input
          id="slug"
          value={category.slug}
          disabled
          className="bg-muted font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={category.description}
          onChange={(e) => setCategory((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Description of category..."
          rows={3}
        />
      </div>

      {/* Cover Image Upload Area */}
      <div className="space-y-2">
        <Label>Cover Photo (Optional)</Label>
        <div className="border rounded-xl p-4 bg-muted/10 space-y-3">
          <div className="flex gap-3 items-center">
            <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Cover Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste cover photo URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-xs bg-card h-8"
                />
                
                <Label
                  htmlFor="category-cover-upload"
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <input
                    id="category-cover-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={isUploading}
                    onChange={handleUpload}
                  />
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort Order</Label>
        <Input
          id="sort_order"
          type="number"
          value={category.sort_order}
          onChange={(e) => setCategory((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
        />
      </div>

      <div className="flex items-center justify-between border p-3 rounded-xl bg-muted/20">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Active Category</Label>
          <p className="text-[10px] text-muted-foreground">Visible in collections.</p>
        </div>
        <Switch
          id="is_active"
          checked={category.is_active}
          onCheckedChange={(val) => setCategory((prev) => ({ ...prev, is_active: val }))}
        />
      </div>

      <Button type="submit" disabled={isSubmitting || isUploading} className="w-full rounded-full font-semibold gap-1.5 mt-2">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" /> Create Category
          </>
        )}
      </Button>
    </form>
  );
}
