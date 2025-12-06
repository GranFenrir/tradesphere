import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { ArrowLeft, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import { createSalesOrder } from "../actions";

export default async function NewSalesOrderPage() {
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  if (customers.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/sales-orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground neon-text">
              New Sales Order
            </h1>
          </div>
        </div>

        <Card className="glass-card max-w-2xl">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You need at least one customer to create a sales order.
            </p>
            <Link href="/customers/new">
              <Button>Add Customer First</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/sales-orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">
            New Sales Order
          </h1>
          <p className="text-muted-foreground mt-2">
            Create a new order for a customer.
          </p>
        </div>
      </div>

      <Card className="glass-card max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <CardTitle className="text-foreground">Order Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action={createSalesOrder} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="customerId" className="text-sm font-medium text-foreground">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                id="customerId"
                name="customerId"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="shippingAddress" className="text-sm font-medium text-foreground">
                Shipping Address
              </label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Enter shipping address..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-foreground">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Any special instructions or notes..."
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-border">
              <Button type="submit" className="shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                Create Order
              </Button>
              <Link href="/sales-orders">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-card max-w-2xl">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Next Steps:</strong> After creating the order, 
            you&apos;ll be able to add products and ship the order.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
