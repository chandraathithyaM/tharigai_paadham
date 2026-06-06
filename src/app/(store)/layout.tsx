import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { WhatsAppButton } from "@/components/store/whatsapp-button";
import { getCategories } from "@/actions/categories";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/actions/store";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();
  const clerkUser = await currentUser();
  const dbUser = clerkUser ? await getUserByClerkId(clerkUser.id) : null;
  const isAdmin = dbUser?.role === "admin";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar categories={categories} isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
