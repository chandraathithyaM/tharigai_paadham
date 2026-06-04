import { getCustomers } from "@/actions/store";
import { Users } from "lucide-react";
import { CustomersTable } from "@/components/admin/customers-table";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" /> Customers Directory
        </h1>
        <p className="text-muted-foreground mt-1">
          Review details of clients, register date, and manage account block actions.
        </p>
      </div>

      <CustomersTable customers={customers} />
    </div>
  );
}
