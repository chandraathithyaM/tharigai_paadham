"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import {
  getUserByClerkId,
  getUserAddresses,
  createAddress,
  createOrder,
  validateCoupon,
} from "@/actions/store";
import type { Address } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Plus, CreditCard, ShieldCheck, Tag, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CheckoutPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const { items: cartItems, getSubtotal, clearCart } = useCartStore();

  // DB States
  const [dbUser, setDbUser] = React.useState<any>(null);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("");
  const [isAddressesLoading, setIsAddressesLoading] = React.useState(true);

  // Address form states
  const [showNewAddressForm, setShowNewAddressForm] = React.useState(false);
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

  // Coupon states
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);

  // General Page Loading / Processing
  const [isProcessingOrder, setIsProcessingOrder] = React.useState(false);

  const subtotal = getSubtotal();
  const shippingThreshold = 999;
  const shippingFee = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 100;

  // Calculate discount
  const discountAmount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === "percentage") {
      const computed = (subtotal * appliedCoupon.discount_value) / 100;
      return appliedCoupon.max_discount_amount
        ? Math.min(computed, appliedCoupon.max_discount_amount)
        : computed;
    } else {
      return Math.min(appliedCoupon.discount_value, subtotal);
    }
  }, [appliedCoupon, subtotal]);

  const total = subtotal + shippingFee - discountAmount;

  // Redirect if cart is empty
  React.useEffect(() => {
    if (isUserLoaded && cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, isUserLoaded, router]);

  // Load user database record & addresses
  React.useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      try {
        const dbUserRec = await getUserByClerkId(user.id);
        if (dbUserRec) {
          setDbUser(dbUserRec);
          const savedAddresses = await getUserAddresses(dbUserRec.id);
          setAddresses(savedAddresses);
          if (savedAddresses.length > 0) {
            const defaultAddr = savedAddresses.find((a) => a.is_default);
            setSelectedAddressId(defaultAddr?.id || savedAddresses[0].id);
          } else {
            setShowNewAddressForm(true);
          }
        }
      } catch (err) {
        console.error("Failed to load checkout user data:", err);
        toast.error("Failed to retrieve profile data.");
      } finally {
        setIsAddressesLoading(false);
      }
    }

    if (isUserLoaded && user) {
      loadUserData();
    }
  }, [user, isUserLoaded]);

  // Handle coupon validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const coupon = await validateCoupon(couponCode, subtotal);
      if (coupon) {
        setAppliedCoupon(coupon);
        toast.success(`Coupon "${coupon.code}" applied successfully!`);
      } else {
        toast.error("Invalid coupon or minimum order amount not met.");
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error validating coupon.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed.");
  };

  // Add new address
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
        setAddresses((prev) => [...prev, created]);
        setSelectedAddressId(created.id);
        setShowNewAddressForm(false);
        setNewAddress({
          full_name: "",
          phone: "",
          address_line1: "",
          address_line2: "",
          city: "",
          state: "",
          pincode: "",
        });
        toast.success("Address added successfully.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address.");
    } finally {
      setIsAddingAddress(false);
    }
  };

  // Handle Order Placement & Razorpay Payment
  const handlePayment = async () => {
    const activeAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!activeAddress) {
      toast.error("Please select a shipping address.");
      return;
    }

    setIsProcessingOrder(true);
    try {
      // 1. Create Order in Razorpay API
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment order on Razorpay");
      }

      const razorpayOrder = await response.json();

      // 2. Format Order Items
      const orderItems = cartItems.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.product.discount_price ?? item.product.price,
      }));

      // 3. Create Pending Order in Database
      const dbOrder = await createOrder({
        user_id: dbUser.id,
        shipping_address: {
          full_name: activeAddress.full_name,
          phone: activeAddress.phone,
          address_line1: activeAddress.address_line1,
          address_line2: activeAddress.address_line2 || undefined,
          city: activeAddress.city,
          state: activeAddress.state,
          pincode: activeAddress.pincode,
        },
        coupon_code: appliedCoupon?.code || undefined,
        subtotal,
        discount_amount: discountAmount,
        shipping_amount: shippingFee,
        total,
        items: orderItems,
        notes: "Web checkout",
      });

      if (!dbOrder) {
        throw new Error("Failed to create order in database");
      }

      // 4. Trigger Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Tharigai Paadham",
        description: "Footwear order payment",
        order_id: razorpayOrder.orderId,
        handler: async function (paymentResponse: any) {
          setIsProcessingOrder(true);
          try {
            // Verify payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                order_id: dbOrder.id,
              }),
            });

            const verifyResult = await verifyRes.json();

            if (verifyResult.verified) {
              clearCart();
              toast.success("Order placed and payment verified successfully!");
              router.push(`/orders/${dbOrder.id}`);
            } else {
              toast.error("Payment verification failed. Please contact customer support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Error verifying payment.");
          } finally {
            setIsProcessingOrder(false);
          }
        },
        prefill: {
          name: activeAddress.full_name,
          email: user?.primaryEmailAddress?.emailAddress || "",
          contact: activeAddress.phone,
        },
        theme: {
          color: "#0a0a0a",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingOrder(false);
            toast.warning("Payment cancelled. You can complete it from your Order History.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong while processing your order.");
      setIsProcessingOrder(false);
    }
  };

  if (!isUserLoaded || isAddressesLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Back button */}
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link href="/cart" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Return to Cart
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Section */}
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                1. Shipping Address
              </h2>

              {/* Saved Addresses list */}
              {addresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer relative transition-all duration-200 ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/30 bg-card"
                        }`}
                      >
                        {selectedAddressId === addr.id && (
                          <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <p className="font-semibold text-sm">{addr.full_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {addr.address_line1}
                          {addr.address_line2 ? `, ${addr.address_line2}` : ""}, {addr.city},{" "}
                          {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2 rounded-full border-dashed"
                    onClick={() => setShowNewAddressForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Ship to a New Address
                  </Button>
                </div>
              )}

              {/* New Address form */}
              {showNewAddressForm && (
                <form onSubmit={handleAddAddress} className="space-y-4 animate-fade-in">
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
                      placeholder="Flat, House no., Building, Company, Apartment"
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
                      placeholder="Area, Street, Sector, Village"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City / District *</Label>
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
                        placeholder="6-digit pincode"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    {addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setShowNewAddressForm(false)}
                      >
                        Cancel
                      </Button>
                    )}
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
                        "Save & Deliver Here"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Payment Method section (fixed to Razorpay) */}
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                2. Payment Method
              </h2>
              <div className="border border-primary bg-primary/5 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Secure Payment Gateway</p>
                    <p className="text-xs text-muted-foreground">Pay via Cards, UPI, NetBanking or Wallets</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded uppercase tracking-wider">
                  Razorpay
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order review sidebar */}
        <div>
          <Card className="border bg-card/65 backdrop-blur-md sticky top-24">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-bold">Order Details</h2>

              {/* Cart items list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-center gap-3 text-xs">
                    <div className="relative h-12 w-12 rounded border overflow-hidden shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="object-cover h-full w-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.product.name}</p>
                      <p className="text-muted-foreground truncate">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold shrink-0">
                      {formatPrice((item.product.discount_price ?? item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Coupon input */}
              <div className="space-y-2">
                <Label htmlFor="coupon" className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Apply Promo Code
                </Label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 p-2 rounded-xl text-xs">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      &quot;{appliedCoupon.code}&quot; Applied!
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="h-6 text-xs text-muted-foreground hover:text-destructive px-2"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input
                      id="coupon"
                      placeholder="e.g. SUMMER25"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="rounded-full bg-muted/30"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isValidatingCoupon}
                      className="rounded-full px-5 text-xs font-semibold shrink-0"
                    >
                      {isValidatingCoupon ? "Validating..." : "Apply"}
                    </Button>
                  </form>
                )}
              </div>

              <Separator />

              {/* Price summary */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-bold text-lg text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Button
                type="button"
                size="lg"
                disabled={isProcessingOrder || addresses.length === 0 || !selectedAddressId}
                onClick={handlePayment}
                className="w-full rounded-full font-bold gap-2"
              >
                {isProcessingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    Pay & Place Order <ShieldCheck className="h-5 w-5" />
                  </>
                )}
              </Button>

              {addresses.length === 0 && (
                <p className="text-[11px] text-center text-destructive font-medium">
                  * Add shipping address to unlock payment
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
