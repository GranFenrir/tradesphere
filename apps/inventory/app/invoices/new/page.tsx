import { prisma } from "@repo/database";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { createInvoice } from "../actions";

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function NewInvoicePage({ searchParams }: Props) {
  const params = await searchParams;
  const type = params.type === "purchase" ? "PURCHASE" : "SALES";
  const isSales = type === "SALES";

  // Fetch customers or suppliers based on type
  const customers = isSales
    ? await prisma.customer.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      })
    : [];

  const suppliers = !isSales
    ? await prisma.supplier.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      })
    : [];

  // Default due date (30 days from now)
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/invoices">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            New {isSales ? "Sales Invoice" : "Purchase Bill"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSales
              ? "Create an invoice for a customer"
              : "Record a bill from a supplier"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="glass-card max-w-2xl">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createInvoice} className="space-y-6">
            <input type="hidden" name="type" value={type} />

            {/* Customer/Supplier Selection */}
            <div>
              <label
                htmlFor={isSales ? "customerId" : "supplierId"}
                className="text-sm font-medium text-foreground"
              >
                {isSales ? "Customer" : "Supplier"} *
              </label>
              <select
                id={isSales ? "customerId" : "supplierId"}
                name={isSales ? "customerId" : "supplierId"}
                required
                className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="">Select {isSales ? "a customer" : "a supplier"}</option>
                {isSales
                  ? customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.code})
                      </option>
                    ))
                  : suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.code})
                      </option>
                    ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="text-sm font-medium text-foreground">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                required
                defaultValue={defaultDueDate.toISOString().split("T")[0]}
                className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            {/* Tax Rate */}
            <div>
              <label htmlFor="taxRate" className="text-sm font-medium text-foreground">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                id="taxRate"
                name="taxRate"
                step="0.01"
                min="0"
                max="100"
                defaultValue="0"
                className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            {/* Payment Terms */}
            <div>
              <label htmlFor="terms" className="text-sm font-medium text-foreground">
                Payment Terms
              </label>
              <input
                type="text"
                id="terms"
                name="terms"
                placeholder="e.g., Net 30, Due on Receipt"
                className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="text-sm font-medium text-foreground">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Additional notes..."
                className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit">
                Create {isSales ? "Invoice" : "Bill"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/invoices">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
