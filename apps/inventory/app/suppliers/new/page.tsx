import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { createSupplier } from "../actions";

export default function NewSupplierPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/suppliers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Add Supplier</h1>
          <p className="text-muted-foreground mt-2">
            Register a new supplier for your inventory.
          </p>
        </div>
      </div>

      <Card className="glass-card max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <CardTitle className="text-foreground">Supplier Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action={createSupplier} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium text-foreground">
                    Supplier Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                    placeholder="SUP-001"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="contact@supplier.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-foreground">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="123 Supply Chain Blvd, City, State, ZIP"
                />
              </div>
            </div>

            {/* Business Terms */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Business Terms
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="leadTimeDays" className="text-sm font-medium text-foreground">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    id="leadTimeDays"
                    name="leadTimeDays"
                    min="0"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="7"
                  />
                  <p className="text-xs text-muted-foreground">
                    Average time from order to delivery
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="paymentTerms" className="text-sm font-medium text-foreground">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    id="paymentTerms"
                    name="paymentTerms"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Net 30"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-foreground">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Additional notes about this supplier..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-border">
              <Button type="submit" className="shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                Create Supplier
              </Button>
              <Link href="/suppliers">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
