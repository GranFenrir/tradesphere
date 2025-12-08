import { NextResponse } from "next/server";
import { prisma, InvoiceStatus, InvoiceType } from "@repo/database";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: {
          select: { id: true, name: true, code: true },
        },
        supplier: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const overdueStatuses = [InvoiceStatus.SENT, InvoiceStatus.PARTIAL] as string[];

    const stats = {
      total: invoices.length,
      draft: invoices.filter((inv) => inv.status === InvoiceStatus.DRAFT).length,
      sent: invoices.filter((inv) => inv.status === InvoiceStatus.SENT).length,
      overdue: invoices.filter(
        (inv) =>
          overdueStatuses.includes(inv.status) && new Date(inv.dueDate) < now
      ).length,
      totalReceivable: invoices
        .filter((inv) => inv.type === InvoiceType.SALES && Number(inv.amountDue) > 0)
        .reduce((sum, inv) => sum + Number(inv.amountDue), 0),
      totalPayable: invoices
        .filter((inv) => inv.type === InvoiceType.PURCHASE && Number(inv.amountDue) > 0)
        .reduce((sum, inv) => sum + Number(inv.amountDue), 0),
    };

    // Convert Decimal fields to numbers for JSON serialization
    const serializedInvoices = invoices.map((inv) => ({
      ...inv,
      subtotal: Number(inv.subtotal),
      taxRate: Number(inv.taxRate),
      taxAmount: Number(inv.taxAmount),
      discount: Number(inv.discount),
      total: Number(inv.total),
      amountPaid: Number(inv.amountPaid),
      amountDue: Number(inv.amountDue),
      exchangeRate: Number(inv.exchangeRate),
    }));

    return NextResponse.json({ invoices: serializedInvoices, stats });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
