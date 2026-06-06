"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createBanner } from "@/actions/store";
import { createClient } from "@/lib/supabase/client";

export function BannerForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");

  const [banner, setBanner] = React.useState({
    title: "",
    subtitle: "",
    link_url: "",
    sort_order: 0,
  });

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
        .from("banners")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("banners")
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Cover image uploaded successfully!");
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

    if (!banner.title || !imageUrl) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBanner({
        title: banner.title,
        subtitle: banner.subtitle || null,
        image_url: imageUrl,
        link_url: banner.link_url || null,
        sort_order: Number(banner.sort_order),
        is_active: true,
      });

      toast.success("Banner created successfully!");
      
      // Reset form
      setBanner({
        title: "",
        subtitle: "",
        link_url: "",
        sort_order: 0,
      });
      setImageUrl("");
      
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Slide Title *</Label>
        <Input
          id="title"
          value={banner.title}
          onChange={(e) => setBanner((prev) => ({ ...prev, title: e.target.value }))}
          required
          placeholder="e.g. Summer Collection 2026"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle / Promotion Text</Label>
        <Input
          id="subtitle"
          value={banner.subtitle}
          onChange={(e) => setBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
          placeholder="e.g. Get up to 50% off on premium styles"
        />
      </div>

      {/* Banner Image Upload Area */}
      <div className="space-y-2">
        <Label>Cover Photo *</Label>
        <div className="border rounded-xl p-4 bg-muted/10 space-y-3">
          <div className="flex gap-3 items-center">
            <div className="relative h-14 w-28 shrink-0 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
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
                  placeholder="Paste banner image URL or upload file..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-xs bg-card h-8"
                  required
                />
                
                <Label
                  htmlFor="banner-cover-upload"
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <input
                    id="banner-cover-upload"
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
        <Label htmlFor="link_url">Target Link URL (Optional)</Label>
        <Input
          id="link_url"
          value={banner.link_url}
          onChange={(e) => setBanner((prev) => ({ ...prev, link_url: e.target.value }))}
          placeholder="e.g. /products?gender=men"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort Order</Label>
        <Input
          id="sort_order"
          type="number"
          value={banner.sort_order}
          onChange={(e) => setBanner((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
        />
      </div>

      <Button type="submit" disabled={isSubmitting || isUploading} className="w-full rounded-full font-semibold gap-1.5 mt-2">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" /> Create Banner
          </>
        )}
      </Button>
    </form>
  );
}
