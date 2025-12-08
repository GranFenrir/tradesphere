import { prisma, InvoiceStatus, InvoiceType, PaymentMethod } from "@repo/database";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  DollarSign,
  Building2,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  updateInvoiceStatus,
  addInvoiceItem,
  removeInvoiceItem,
  recordPayment,
  deleteInvoice,
} from "../actions";

interface Props {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  DRAFT: { label: "Draft", color: "text-gray-400", bgColor: "bg-gray-500/20" },
  SENT: { label: "Sent", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  PAID: { label: "Paid", color: "text-green-400", bgColor: "bg-green-500/20" },
  PARTIAL: { label: "Partial", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  OVERDUE: { label: "Overdue", color: "text-red-400", bgColor: "bg-red-500/20" },
  CANCELLED: { label: "Cancelled", color: "text-gray-400", bgColor: "bg-gray-500/20" },
  REFUNDED: { label: "Refunded", color: "text-purple-400", bgColor: "bg-purple-500/20" },
};

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      supplier: true,
      items: {
        include: { product: true },
        orderBy: { createdAt: "asc" },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
      createdBy: true,
    },
  });

  if (!invoice) {
    notFound();
  }

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  const isSales = invoice.type === InvoiceType.SALES;
  const config = statusConfig[invoice.status] ?? statusConfig.DRAFT!;

  const formatCurrency = (amount: number | { toString(): string }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
    }).format(Number(amount));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOverdue =
    (invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.PARTIAL) &&
    new Date(invoice.dueDate) < new Date();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/invoices">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                {invoice.invoiceNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}
              >
                {isOverdue ? "Overdue" : config.label}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              {isSales ? "Sales Invoice" : "Purchase Bill"} •{" "}
              {formatDate(invoice.invoiceDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.status === InvoiceStatus.DRAFT && (
            <>
              <form action={updateInvoiceStatus.bind(null, id, InvoiceStatus.SENT)}>
                <Button type="submit" variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Mark as Sent
                </Button>
              </form>
              <form action={deleteInvoice.bind(null, id)}>
                <Button type="submit" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </form>
            </>
          )}
          {invoice.status === InvoiceStatus.SENT && (
            <form action={updateInvoiceStatus.bind(null, id, InvoiceStatus.CANCELLED)}>
              <Button type="submit" variant="outline">
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Invoice
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {isSales ? "Customer" : "Supplier"} Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-foreground font-medium">
                    {isSales
                      ? invoice.customer?.name ?? "Unknown"
                      : invoice.supplier?.name ?? "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="text-foreground">
                    {isSales
                      ? invoice.customer?.code ?? "—"
                      : invoice.supplier?.code ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">
                    {isSales
                      ? invoice.customer?.email ?? "—"
                      : invoice.supplier?.email ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground">
                    {isSales
                      ? invoice.customer?.phone ?? "—"
                      : invoice.supplier?.phone ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Line Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Description
                      </th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                        Qty
                      </th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                        Unit Price
                      </th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                        Tax
                      </th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                        Total
                      </th>
                      {invoice.status === InvoiceStatus.DRAFT && (
                        <th className="p-3"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center p-8 text-muted-foreground"
                        >
                          No items added yet
                        </td>
                      </tr>
                    ) : (
                      invoice.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-border/50"
                        >
                          <td className="p-3">
                            <p className="font-medium text-foreground">
                              {item.description}
                            </p>
                            {item.product && (
                              <p className="text-sm text-muted-foreground">
                                SKU: {item.product.sku}
                              </p>
                            )}
                          </td>
                          <td className="p-3 text-right text-foreground">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-right text-foreground">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="p-3 text-right text-muted-foreground">
                            {Number(item.taxRate)}%
                          </td>
                          <td className="p-3 text-right font-medium text-foreground">
                            {formatCurrency(item.total)}
                          </td>
                          {invoice.status === InvoiceStatus.DRAFT && (
                            <td className="p-3">
                              <form
                                action={removeInvoiceItem.bind(
                                  null,
                                  item.id,
                                  invoice.id
                                )}
                              >
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </form>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Item Form */}
              {invoice.status === InvoiceStatus.DRAFT && (
                <form
                  action={addInvoiceItem.bind(null, invoice.id)}
                  className="mt-6 p-4 bg-muted/10 rounded-lg border border-border"
                >
                  <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground">
                        Product (optional)
                      </label>
                      <select
                        name="productId"
                        className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-foreground"
                      >
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-sm text-muted-foreground">
                        Description *
                      </label>
                      <input
                        type="text"
                        name="description"
                        required
                        className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Qty *</label>
                      <input
                        type="number"
                        name="quantity"
                        required
                        min="1"
                        defaultValue="1"
                        className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Unit Price *
                      </label>
                      <input
                        type="number"
                        name="unitPrice"
                        required
                        step="0.01"
                        min="0"
                        className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Tax %</label>
                      <input
                        type="number"
                        name="taxRate"
                        step="0.01"
                        min="0"
                        max="100"
                        defaultValue={Number(invoice.taxRate)}
                        className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-foreground"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="w-full">
                        Add
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Payments */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No payments recorded
                </p>
              ) : (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-muted/10 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {payment.paymentNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.paymentDate)} • {payment.method}
                        </p>
                      </div>
                      <p className="font-bold text-green-400">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Record Payment Form */}
              {(invoice.status === InvoiceStatus.SENT ||
                invoice.status === InvoiceStatus.PARTIAL) &&
                Number(invoice.amountDue) > 0 && (
                  <form
                    action={recordPayment.bind(null, invoice.id)}
                    className="mt-6 p-4 bg-muted/10 rounded-lg border border-border"
                  >
                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Record Payment
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Amount *
                        </label>
                        <input
                          type="number"
                          name="amount"
                          required
                          step="0.01"
                          min="0.01"
                          max={Number(invoice.amountDue)}
                          defaultValue={Number(invoice.amountDue)}
                          className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Method</label>
                        <select
                          name="method"
                          className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-foreground"
                        >
                          <option value={PaymentMethod.BANK_TRANSFER}>
                            Bank Transfer
                          </option>
                          <option value={PaymentMethod.CASH}>Cash</option>
                          <option value={PaymentMethod.CREDIT_CARD}>
                            Credit Card
                          </option>
                          <option value={PaymentMethod.CHECK}>Check</option>
                          <option value={PaymentMethod.OTHER}>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Reference
                        </label>
                        <input
                          type="text"
                          name="reference"
                          placeholder="Transaction ID"
                          className="mt-1 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-foreground"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button type="submit" className="w-full">
                          Record
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">
                  {formatCurrency(invoice.taxAmount)}
                </span>
              </div>
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-400">
                    -{formatCurrency(invoice.discount)}
                  </span>
                </div>
              )}
              <hr className="border-border" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="text-green-400">
                  {formatCurrency(invoice.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Balance Due</span>
                <span
                  className={
                    Number(invoice.amountDue) > 0 ? "text-red-400" : "text-green-400"
                  }
                >
                  {formatCurrency(invoice.amountDue)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Date</p>
                <p className="text-foreground">{formatDate(invoice.invoiceDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className={isOverdue ? "text-red-400 font-medium" : "text-foreground"}>
                  {formatDate(invoice.dueDate)}
                  {isOverdue && " (Overdue)"}
                </p>
              </div>
              {invoice.paidDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Paid Date</p>
                  <p className="text-green-400">{formatDate(invoice.paidDate)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(invoice.notes || invoice.terms) && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.terms && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Terms</p>
                    <p className="text-foreground">{invoice.terms}</p>
                  </div>
                )}
                {invoice.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-foreground whitespace-pre-wrap">
                      {invoice.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
