import { getStoreSettings, updateStoreSettings } from "@/actions/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  // Server action to save settings
  async function handleSaveSettings(formData: FormData) {
    "use server";
    const store_name = formData.get("store_name") as string;
    const whatsapp_number = formData.get("whatsapp_number") as string;
    const instagram_url = formData.get("instagram_url") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const pincode = formData.get("pincode") as string;
    const shipping_fee = parseFloat(formData.get("shipping_fee") as string) || 0;
    const free_shipping_threshold = parseFloat(formData.get("free_shipping_threshold") as string) || 0;

    await updateStoreSettings({
      store_name: store_name || "Tharigai Paadham Footwear",
      whatsapp_number: whatsapp_number || "+91 96888 22826",
      instagram_url: instagram_url || "https://instagram.com/tharigai_paadham_puliampatti",
      email: email || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      shipping_fee,
      free_shipping_threshold,
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    redirect("/admin/settings");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" /> Store Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure general configurations, links, phone metadata, and shipping details.
        </p>
      </div>

      <form action={handleSaveSettings}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* General settings panel */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">General Configurations</CardTitle>
                <CardDescription>Brand titles and contact options.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Store Brand Name *</Label>
                  <Input
                    id="store_name"
                    name="store_name"
                    defaultValue={settings?.store_name || "Tharigai Paadham Footwear"}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={settings?.email || ""}
                      placeholder="support@tharigaipaadham.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={settings?.phone || ""}
                      placeholder="+91 96888 22826"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={settings?.address || ""}
                    placeholder="Shop address details..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" defaultValue={settings?.city || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" defaultValue={settings?.state || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" name="pincode" defaultValue={settings?.pincode || ""} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Social & Chat Channels</CardTitle>
                <CardDescription>Configure external integrations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_number">WhatsApp Chat Number *</Label>
                    <Input
                      id="whatsapp_number"
                      name="whatsapp_number"
                      defaultValue={settings?.whatsapp_number || "+91 96888 22826"}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">Instagram Profile URL *</Label>
                    <Input
                      id="instagram_url"
                      name="instagram_url"
                      defaultValue={settings?.instagram_url || "https://instagram.com/tharigai_paadham_puliampatti"}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing configurations sidebar */}
          <div className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Shipping fees</CardTitle>
                <CardDescription>Setup delivery costs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping_fee">Base Shipping Fee (₹)</Label>
                  <Input
                    id="shipping_fee"
                    name="shipping_fee"
                    type="number"
                    defaultValue={Number(settings?.shipping_fee || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="free_shipping_threshold">Free Shipping Threshold (₹)</Label>
                  <Input
                    id="free_shipping_threshold"
                    name="free_shipping_threshold"
                    type="number"
                    defaultValue={Number(settings?.free_shipping_threshold || 999)}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full rounded-full font-bold gap-2">
              <Save className="h-4 w-4" /> Save Configuration
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
