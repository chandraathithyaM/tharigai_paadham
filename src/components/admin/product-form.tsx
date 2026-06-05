"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, ArrowLeft, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types";
import { createProductWithDetails, updateProductWithDetails } from "@/actions/products";
import { createClient } from "@/lib/supabase/client";

interface ProductFormProps {
  categories: Category[];
  initialData?: any; // For editing
  title: string;
}

export function ProductForm({ categories, initialData, title }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadingImageIndices, setUploadingImageIndices] = React.useState<Record<number, boolean>>({});
  const [isBatchUploading, setIsBatchUploading] = React.useState(false);
  const [isDragActive, setIsDragActive] = React.useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
    }
    if (!file.type.startsWith("image/")) {
      throw new Error(`File ${file.name} is not an image.`);
    }

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const fileName = `${Date.now()}-${uniqueId}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("products")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSingleUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageIndices((prev) => ({ ...prev, [idx]: true }));
    try {
      const publicUrl = await uploadFile(file);
      updateImageRow(idx, "url", publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingImageIndices((prev) => ({ ...prev, [idx]: false }));
      e.target.value = "";
    }
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsBatchUploading(true);
    let successCount = 0;
    const newImages = [...images];
    let isFirstRowEmpty = newImages.length === 1 && newImages[0].url.trim() === "";

    for (const file of files) {
      try {
        const publicUrl = await uploadFile(file);
        const isPrimary = newImages.length === 0 || (newImages.length === 1 && isFirstRowEmpty);
        
        if (isFirstRowEmpty) {
          newImages[0] = { url: publicUrl, is_primary: true };
          isFirstRowEmpty = false;
        } else {
          newImages.push({ url: publicUrl, is_primary: isPrimary });
        }
        successCount++;
      } catch (err: any) {
        console.error(err);
        toast.error(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    
    setImages(newImages);
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} image(s)!`);
    }
    setIsBatchUploading(false);
    e.target.value = "";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    setIsBatchUploading(true);
    let successCount = 0;
    const newImages = [...images];
    let isFirstRowEmpty = newImages.length === 1 && newImages[0].url.trim() === "";

    for (const file of files) {
      try {
        const publicUrl = await uploadFile(file);
        const isPrimary = newImages.length === 0 || (newImages.length === 1 && isFirstRowEmpty);
        
        if (isFirstRowEmpty) {
          newImages[0] = { url: publicUrl, is_primary: true };
          isFirstRowEmpty = false;
        } else {
          newImages.push({ url: publicUrl, is_primary: isPrimary });
        }
        successCount++;
      } catch (err: any) {
        console.error(err);
        toast.error(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    
    setImages(newImages);
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} image(s)!`);
    }
    setIsBatchUploading(false);
  };

  const isAnyImageUploading = Object.values(uploadingImageIndices).some(Boolean) || isBatchUploading;

  // Base product state
  const [product, setProduct] = React.useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    brand: initialData?.brand || "",
    category_id: initialData?.category_id || "",
    price: initialData?.price || "",
    discount_price: initialData?.discount_price || "",
    gender: initialData?.gender || "unisex",
    is_featured: initialData?.is_featured ?? false,
    is_active: initialData?.is_active ?? true,
    meta_title: initialData?.meta_title || "",
    meta_description: initialData?.meta_description || "",
  });

  // Images state
  const [images, setImages] = React.useState<{ url: string; is_primary: boolean }[]>(
    initialData?.images?.map((img: any) => ({
      url: img.url,
      is_primary: img.is_primary,
    })) || [{ url: "", is_primary: true }]
  );

  // Sizes state
  const [sizes, setSizes] = React.useState<{ size: string; stock: number }[]>(
    initialData?.sizes?.map((s: any) => ({
      size: s.size,
      stock: s.stock,
    })) || [{ size: "UK 7", stock: 10 }]
  );

  // Colors state
  const [colors, setColors] = React.useState<{ name: string; hex_code: string }[]>(
    initialData?.colors?.map((c: any) => ({
      name: c.name,
      hex_code: c.hex_code,
    })) || [{ name: "Black", hex_code: "#000000" }]
  );

  // Auto-slugify when name changes
  React.useEffect(() => {
    if (!initialData) {
      setProduct((prev) => ({ ...prev, slug: slugify(prev.name) }));
    }
  }, [product.name, initialData]);

  // Image actions
  const addImageRow = () => {
    setImages((prev) => [...prev, { url: "", is_primary: false }]);
  };

  const updateImageRow = (idx: number, field: string, val: any) => {
    setImages((prev) =>
      prev.map((img, i) => {
        if (i === idx) {
          return { ...img, [field]: val };
        }
        // If setting primary, unset others
        if (field === "is_primary" && val === true && i !== idx) {
          return { ...img, is_primary: false };
        }
        return img;
      })
    );
  };

  const removeImageRow = (idx: number) => {
    if (images.length === 1) return;
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      // Make sure at least one is primary
      if (prev[idx].is_primary) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  // Size actions
  const addSizeRow = () => {
    setSizes((prev) => [...prev, { size: "UK " + (prev.length + 6), stock: 10 }]);
  };

  const updateSizeRow = (idx: number, field: string, val: any) => {
    setSizes((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const removeSizeRow = (idx: number) => {
    if (sizes.length === 1) return;
    setSizes((prev) => prev.filter((_, i) => i !== idx));
  };

  // Color actions
  const addColorRow = () => {
    setColors((prev) => [...prev, { name: "", hex_code: "#000000" }]);
  };

  const updateColorRow = (idx: number, field: string, val: any) => {
    setColors((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c))
    );
  };

  const removeColorRow = (idx: number) => {
    if (colors.length === 1) return;
    setColors((prev) => prev.filter((_, i) => i !== idx));
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAnyImageUploading) {
      toast.error("Please wait for all images to finish uploading.");
      return;
    }

    if (!product.name || !product.slug || !product.price) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Filter empty rows
    const filteredImages = images.filter((img) => img.url.trim() !== "");
    const filteredSizes = sizes.filter((s) => s.size.trim() !== "");
    const filteredColors = colors.filter((c) => c.name.trim() !== "");

    if (filteredImages.length === 0) {
      toast.error("Please provide at least one image URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const productPayload = {
        product: {
          ...product,
          price: parseFloat(product.price as string),
          discount_price: product.discount_price
            ? parseFloat(product.discount_price as string)
            : null,
          category_id: product.category_id || null,
        },
        images: filteredImages,
        sizes: filteredSizes,
        colors: filteredColors,
      };

      if (initialData?.id) {
        await updateProductWithDetails(initialData.id, productPayload);
        toast.success("Product updated!");
      } else {
        await createProductWithDetails(productPayload);
        toast.success("Product created!");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild className="rounded-full">
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || isAnyImageUploading} className="rounded-full px-6">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : isAnyImageUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
              </>
            ) : (
              "Save Product"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-base font-bold">Product Information</h2>

              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={product.name}
                  onChange={(e) => setProduct((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g. Pegasus Running Shoes"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Product Slug *</Label>
                  <Input
                    id="slug"
                    value={product.slug}
                    onChange={(e) => setProduct((prev) => ({ ...prev, slug: e.target.value }))}
                    required
                    placeholder="pegasus-running-shoes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={product.brand}
                    onChange={(e) => setProduct((prev) => ({ ...prev, brand: e.target.value }))}
                    placeholder="e.g. Nike"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={product.description}
                  onChange={(e) => setProduct((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your product catalog details..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price (INR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={product.price}
                    onChange={(e) => setProduct((prev) => ({ ...prev, price: e.target.value }))}
                    required
                    placeholder="₹ 1,999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_price">Discounted Price (Optional)</Label>
                  <Input
                    id="discount_price"
                    type="number"
                    value={product.discount_price}
                    onChange={(e) => setProduct((prev) => ({ ...prev, discount_price: e.target.value }))}
                    placeholder="₹ 1,499"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sizes & Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sizes Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold">Sizes & Stocks</h2>
                  <Button type="button" variant="outline" size="sm" onClick={addSizeRow} className="rounded-full">
                    <Plus className="h-4 w-4 mr-1" /> Add Size
                  </Button>
                </div>

                <div className="space-y-3">
                  {sizes.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="UK Size"
                        value={item.size}
                        onChange={(e) => updateSizeRow(idx, "size", e.target.value)}
                        className="w-1/2"
                      />
                      <Input
                        type="number"
                        placeholder="StockQty"
                        value={item.stock}
                        onChange={(e) => updateSizeRow(idx, "stock", parseInt(e.target.value) || 0)}
                        className="w-1/2"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSizeRow(idx)}
                        disabled={sizes.length === 1}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Colors Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold">Colors & Hex Code</h2>
                  <Button type="button" variant="outline" size="sm" onClick={addColorRow} className="rounded-full">
                    <Plus className="h-4 w-4 mr-1" /> Add Color
                  </Button>
                </div>

                <div className="space-y-3">
                  {colors.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Color Name"
                        value={item.name}
                        onChange={(e) => updateColorRow(idx, "name", e.target.value)}
                        className="w-1/2"
                      />
                      <div className="flex gap-1 items-center w-1/2 border rounded-md px-2 bg-card">
                        <input
                          type="color"
                          value={item.hex_code}
                          onChange={(e) => updateColorRow(idx, "hex_code", e.target.value)}
                          className="h-6 w-6 border-0 rounded cursor-pointer p-0"
                        />
                        <Input
                          value={item.hex_code}
                          onChange={(e) => updateColorRow(idx, "hex_code", e.target.value)}
                          className="border-0 bg-transparent h-8 focus-visible:ring-0 p-1 text-xs font-mono"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColorRow(idx)}
                        disabled={colors.length === 1}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Categories, Banners & Images sidebar */}
        <div className="space-y-6">
          {/* Classification Settings */}
          <Card className="border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-base font-bold">Classifications</h2>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={product.category_id}
                  onValueChange={(val) => setProduct((prev) => ({ ...prev, category_id: val }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender Target</Label>
                <Select
                  value={product.gender as string}
                  onValueChange={(val) => setProduct((prev) => ({ ...prev, gender: val as any }))}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="featured">Featured Product</Label>
                  <p className="text-[10px] text-muted-foreground">Show in featured collections.</p>
                </div>
                <Switch
                  id="featured"
                  checked={product.is_featured}
                  onCheckedChange={(val) => setProduct((prev) => ({ ...prev, is_featured: val }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Active Listing</Label>
                  <p className="text-[10px] text-muted-foreground">Visible to customers.</p>
                </div>
                <Switch
                  id="active"
                  checked={product.is_active}
                  onCheckedChange={(val) => setProduct((prev) => ({ ...prev, is_active: val }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card className="border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" /> Catalog Images
                </h2>
                <Button type="button" variant="outline" size="sm" onClick={addImageRow} className="rounded-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Image
                </Button>
              </div>

              {/* Drag & Drop Batch Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  isDragActive
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/10"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBatchUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isBatchUploading}
                />
                {isBatchUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="text-sm font-medium">Uploading images...</span>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-muted/50 rounded-full text-muted-foreground">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-primary hover:underline">
                        Click to upload
                      </span>{" "}
                      <span className="text-sm text-muted-foreground">
                        or drag and drop
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground/75">
                      PNG, JPG, WEBP up to 5MB each
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-3">
                {images.map((item, idx) => (
                  <div key={idx} className="border p-3 rounded-xl bg-muted/20 space-y-3">
                    <div className="flex gap-3 items-start">
                      {/* Image Preview / Placeholder / Loader */}
                      <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                        {uploadingImageIndices[idx] ? (
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        ) : item.url ? (
                          <img
                            src={item.url}
                            alt={`Preview ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>

                      {/* Inputs and Actions */}
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-1.5 items-center">
                          <Input
                            placeholder="Paste image URL or upload file..."
                            value={item.url}
                            onChange={(e) => updateImageRow(idx, "url", e.target.value)}
                            className="text-xs bg-card h-8"
                          />
                          
                          {/* Single Upload Button */}
                          <Label
                            htmlFor={`single-upload-${idx}`}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <input
                              id={`single-upload-${idx}`}
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              disabled={uploadingImageIndices[idx]}
                              onChange={(e) => handleSingleUpload(idx, e)}
                            />
                          </Label>

                          {/* Delete Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeImageRow(idx)}
                            disabled={images.length === 1}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {item.is_primary ? "Primary Cover Image" : "Catalog Image"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">Primary</span>
                            <Switch
                              checked={item.is_primary}
                              onCheckedChange={(val) => updateImageRow(idx, "is_primary", val)}
                              disabled={uploadingImageIndices[idx]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
