"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserMinus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { toggleBlockUser } from "@/actions/store";
import { toast } from "sonner";

interface CustomersTableProps {
  customers: any[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const handleToggleBlock = async (id: string, currentBlockedStatus: boolean) => {
    setUpdatingId(id);
    try {
      await toggleBlockUser(id, !currentBlockedStatus);
      toast.success(
        currentBlockedStatus ? "User unblocked successfully" : "User blocked successfully"
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update block status");
    } finally {
      setUpdatingId(null);
    }
  };

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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={updatingId === item.id}
          onClick={() => handleToggleBlock(item.id, !!item.is_blocked)}
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
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      searchKey="full_name"
      searchPlaceholder="Search customers by name..."
    />
  );
}
