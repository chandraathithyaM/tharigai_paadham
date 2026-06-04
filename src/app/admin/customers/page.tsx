import { getCustomers, toggleBlockUser } from "@/actions/store";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Users, UserMinus, UserCheck } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  // Server action to block/unblock
  async function handleToggleBlock(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const isBlocked = formData.get("is_blocked") === "true";
    if (id) {
      await toggleBlockUser(id, !isBlocked);
      revalidatePath("/admin/customers");
      redirect("/admin/customers");
    }
  }

  const columns = [
    {
      header: "Avatar",
      accessorKey: "avatar_url",
      cell: (item: any) => (
        <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center border shrink-0">
          {item.avatar_url ? (
            <img src={item.avatar_url} alt={item.full_name || ""} className="object-cover h-full w-full" />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">
              {item.full_name?.charAt(0) || item.email?.charAt(0) || "U"}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Name",
      accessorKey: "full_name",
      cell: (item: any) => (
        <span className="text-xs font-bold text-foreground">{item.full_name || "—"}</span>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (item: any) => (
        <span className="text-xs font-mono text-muted-foreground">{item.email}</span>
      ),
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (item: any) => (
        <span className="text-xs text-muted-foreground">{item.phone || "—"}</span>
      ),
    },
    {
      header: "Registered",
      accessorKey: "created_at",
      cell: (item: any) => (
        <span className="text-xs text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "is_blocked",
      cell: (item: any) => (
        <Badge variant={item.is_blocked ? "destructive" : "default"} className="text-[10px]">
          {item.is_blocked ? "Blocked" : "Active"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item: any) => (
        <form action={handleToggleBlock}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="is_blocked" value={String(item.is_blocked)} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className={`h-8 rounded-full text-xs font-semibold px-3 ${
              item.is_blocked
                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                : "text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
            }`}
          >
            {item.is_blocked ? (
              <>
                <UserCheck className="h-3.5 w-3.5 mr-1" /> Unblock
              </>
            ) : (
              <>
                <UserMinus className="h-3.5 w-3.5 mr-1" /> Block
              </>
            )}
          </Button>
        </form>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" /> Customers Directory
        </h1>
        <p className="text-muted-foreground mt-1">
          Review details of clients, register date, and manage account block actions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="full_name"
        searchPlaceholder="Search customers by name..."
      />
    </div>
  );
}
