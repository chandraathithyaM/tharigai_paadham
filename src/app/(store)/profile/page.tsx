"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import {
  getUserByClerkId,
  getUserAddresses,
  createAddress,
  deleteAddress,
} from "@/actions/store";
import type { Address } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, Trash2, User, Phone, Mail, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [dbUser, setDbUser] = React.useState<any>(null);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Address form states
  const [showAddressForm, setShowAddressForm] = React.useState(false);
  const [newAddress, setNewAddress] = React.useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [isAddingAddress, setIsAddingAddress] = React.useState(false);

  // Fetch addresses
  const loadAddresses = React.useCallback(async (dbUserId: string) => {
    try {
      const data = await getUserAddresses(dbUserId);
      setAddresses(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load addresses");
    }
  }, []);

  React.useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const dbRec = await getUserByClerkId(user.id);
        if (dbRec) {
          setDbUser(dbRec);
          await loadAddresses(dbRec.id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    }

    if (isUserLoaded && user) {
      loadProfile();
    }
  }, [user, isUserLoaded, loadAddresses]);

  // Handle address addition
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUser) return;

    if (
      !newAddress.full_name ||
      !newAddress.phone ||
      !newAddress.address_line1 ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsAddingAddress(true);
    try {
      const created = await createAddress({
        user_id: dbUser.id,
        ...newAddress,
        is_default: addresses.length === 0, // Default if first address
      });

      if (created) {
        toast.success("Address added successfully!");
        setShowAddressForm(false);
        setNewAddress({
          full_name: "",
          phone: "",
          address_line1: "",
          address_line2: "",
          city: "",
          state: "",
          pincode: "",
        });
        await loadAddresses(dbUser.id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address.");
    } finally {
      setIsAddingAddress(false);
    }
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId: string) => {
    if (!dbUser) return;
    try {
      await deleteAddress(addressId);
      toast.success("Address deleted.");
      await loadAddresses(dbUser.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address.");
    }
  };

  if (!isUserLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-60 w-full rounded-xl" />
          <Skeleton className="h-96 md:col-span-2 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal info and shipping addresses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Personal Details Sidebar */}
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <User className="h-8 w-8" />
                )}
              </div>
              <CardTitle className="text-lg">{user?.fullName || "User Account"}</CardTitle>
              <CardDescription>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-muted-foreground">
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground/80" />
                  <span className="truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                {user?.primaryPhoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground/80" />
                    <span>{user.primaryPhoneNumber.phoneNumber}</span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full rounded-full">
                  <Link href="/orders">View Order History</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Addresses Management */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-bold">Saved Addresses</CardTitle>
                <CardDescription>Select or edit your default delivery destinations.</CardDescription>
              </div>
              {!showAddressForm && (
                <Button
                  onClick={() => setShowAddressForm(true)}
                  size="sm"
                  className="rounded-full gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add Address
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {/* Add address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="space-y-4 border p-4 rounded-xl mb-6 bg-muted/20 animate-fade-in">
                  <h3 className="font-bold text-sm">New Delivery Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        required
                        value={newAddress.full_name}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, full_name: e.target.value }))
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        required
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_line1">Address Line 1 *</Label>
                    <Input
                      id="address_line1"
                      required
                      value={newAddress.address_line1}
                      onChange={(e) =>
                        setNewAddress((prev) => ({ ...prev, address_line1: e.target.value }))
                      }
                      placeholder="Flat, House no., Building, Apartment"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address_line2"
                      value={newAddress.address_line2}
                      onChange={(e) =>
                        setNewAddress((prev) => ({ ...prev, address_line2: e.target.value }))
                      }
                      placeholder="Area, Street, Village"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, city: e.target.value }))
                        }
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        required
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, state: e.target.value }))
                        }
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        required
                        value={newAddress.pincode}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, pincode: e.target.value }))
                        }
                        placeholder="Pincode"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isAddingAddress}
                      className="rounded-full px-6"
                    >
                      {isAddingAddress ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                        </>
                      ) : (
                        "Save Address"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* List of addresses */}
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-xl border-2 border-border bg-card flex flex-col justify-between"
                    >
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary shrink-0" /> {addr.full_name}
                          </span>
                          {addr.is_default && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        <p>{addr.phone}</p>
                        <p className="leading-relaxed">
                          {addr.address_line1}
                          {addr.address_line2 ? `, ${addr.address_line2}` : ""}, {addr.city},{" "}
                          {addr.state} - {addr.pincode}
                        </p>
                      </div>

                      <div className="flex justify-end pt-4 border-t mt-4 gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-xl">
                  <MapPin className="h-10 w-10 text-muted-foreground/60 mx-auto mb-2" />
                  <p className="font-bold text-sm">No Saved Addresses</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">You have not added any delivery addresses yet.</p>
                  <Button
                    onClick={() => setShowAddressForm(true)}
                    size="sm"
                    className="rounded-full"
                  >
                    Add Your First Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
