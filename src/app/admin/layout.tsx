import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/actions/store";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  Receipt,
  Users,
  Tag,
  Image as ImageIcon,
  Package,
  Settings,
  ArrowLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SITE_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const isClerkAdmin = clerkUser.publicMetadata?.role === "admin";
  let dbUser = await getUserByClerkId(clerkUser.id);

  if (!dbUser && (isClerkAdmin || process.env.NODE_ENV === "development")) {
    console.log(`Auto-creating admin user record for Clerk ID: ${clerkUser.id}`);
    const supabase = createAdminClient();
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        clerk_id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "admin@example.com",
        full_name: clerkUser.fullName || "Admin User",
        role: "admin",
      })
      .select()
      .single();
    if (!error && newUser) {
      dbUser = newUser;
    } else if (error) {
      console.error("Failed to auto-create admin user:", error.message);
    }
  } else if (dbUser && dbUser.role !== "admin" && (isClerkAdmin || process.env.NODE_ENV === "development")) {
    console.log(`Auto-promoting user ${clerkUser.id} to admin`);
    const supabase = createAdminClient();
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("clerk_id", clerkUser.id)
      .select()
      .single();
    if (!error && updatedUser) {
      dbUser = updatedUser;
    } else if (error) {
      console.error("Failed to auto-promote admin user:", error.message);
    }
  }

  if (!dbUser) {
    console.warn(
      `\n[ADMIN ACCESS DENIED]\nNo database user found for Clerk User ID: "${clerkUser.id}".\nSince you are running locally, the sign-up webhook did not reach localhost. Please copy and execute this SQL query in your Supabase SQL Editor:\n\nINSERT INTO users (clerk_id, email, full_name, role)\nVALUES ('${clerkUser.id}', '${clerkUser.primaryEmailAddress?.emailAddress || "admin@example.com"}', 'Admin User', 'admin')\nON CONFLICT (clerk_id) DO UPDATE SET role = 'admin';\n`
    );
    redirect("/");
  }

  if (dbUser.role !== "admin") {
    console.warn(
      `\n[ADMIN ACCESS DENIED]\nUser "${clerkUser.primaryEmailAddress?.emailAddress}" has role "${dbUser.role}" instead of "admin".\nPlease update the role in your Supabase users table:\n\nUPDATE users SET role = 'admin' WHERE clerk_id = '${clerkUser.id}';\n`
    );
    redirect("/");
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: ShoppingBag },
    { label: "Categories", href: "/admin/categories", icon: Grid },
    { label: "Orders", href: "/admin/orders", icon: Receipt },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Banners", href: "/admin/banners", icon: ImageIcon },
    { label: "Inventory", href: "/admin/inventory", icon: Package },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card shrink-0">
        <div className="h-16 flex items-center px-6 border-b justify-between">
          <Link href="/" className="font-bold text-base tracking-tight gradient-text">
            {SITE_NAME} Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t space-y-2">
          <Button asChild variant="outline" size="sm" className="w-full justify-start rounded-full text-xs">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5 mr-2 shrink-0" /> Return to Store
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open Admin Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="h-16 flex items-center px-6 border-b">
                  <SheetTitle className="font-bold text-base gradient-text">{SITE_NAME} Admin</SheetTitle>
                </div>
                <nav className="p-4 space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t">
                  <Button asChild variant="outline" size="sm" className="w-full justify-start rounded-full text-xs">
                    <Link href="/">
                      <ArrowLeft className="h-3.5 w-3.5 mr-2 shrink-0" /> Return to Store
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <h2 className="font-semibold text-base hidden sm:inline-block">Admin Console</h2>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Dashboard page/subpage viewport */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
