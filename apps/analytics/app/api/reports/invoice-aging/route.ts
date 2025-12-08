import { NextRequest, NextResponse } from "next/server";
import { prisma, InvoiceStatus, InvoiceType } from "@repo/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE],
        },
        amountDue: { gt: 0 },
      },
      include: {
        customer: { select: { name: true, code: true } },
        supplier: { select: { name: true, code: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    const now = new Date();

    const data = invoices.map((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      const daysOverdue = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let agingBucket: string;
      if (daysOverdue <= 0) {
        agingBucket = "Current";
      } else if (daysOverdue <= 30) {
        agingBucket = "1-30 days";
      } else if (daysOverdue <= 60) {
        agingBucket = "31-60 days";
      } else if (daysOverdue <= 90) {
        agingBucket = "61-90 days";
      } else {
        agingBucket = "90+ days";
      }

      return {
        invoiceNumber: invoice.invoiceNumber,
        type: invoice.type,
        party:
          invoice.type === InvoiceType.SALES
            ? invoice.customer?.name ?? "Unknown"
            : invoice.supplier?.name ?? "Unknown",
        partyCode:
          invoice.type === InvoiceType.SALES
            ? invoice.customer?.code ?? ""
            : invoice.supplier?.code ?? "",
        invoiceDate: invoice.invoiceDate.toISOString().split("T")[0],
        dueDate: invoice.dueDate.toISOString().split("T")[0],
        total: Number(invoice.total),
        amountPaid: Number(invoice.amountPaid),
        amountDue: Number(invoice.amountDue),
        daysOverdue: Math.max(0, daysOverdue),
        agingBucket,
      };
    });

    // Summary by aging bucket
    const agingSummary = {
      current: data.filter((d) => d.agingBucket === "Current").reduce((sum, d) => sum + d.amountDue, 0),
      days1to30: data.filter((d) => d.agingBucket === "1-30 days").reduce((sum, d) => sum + d.amountDue, 0),
      days31to60: data.filter((d) => d.agingBucket === "31-60 days").reduce((sum, d) => sum + d.amountDue, 0),
      days61to90: data.filter((d) => d.agingBucket === "61-90 days").reduce((sum, d) => sum + d.amountDue, 0),
      days90plus: data.filter((d) => d.agingBucket === "90+ days").reduce((sum, d) => sum + d.amountDue, 0),
      totalOutstanding: data.reduce((sum, d) => sum + d.amountDue, 0),
    };

    // Split by type
    const receivables = data.filter((d) => d.type === InvoiceType.SALES);
    const payables = data.filter((d) => d.type === InvoiceType.PURCHASE);

    if (format === "csv") {
      const headers = [
        "Invoice #",
        "Type",
        "Customer/Supplier",
        "Code",
        "Invoice Date",
        "Due Date",
        "Total",
        "Paid",
        "Due",
        "Days Overdue",
        "Aging Bucket",
      ];
      const rows = data.map((d) => [
        d.invoiceNumber,
        d.type,
        `"${d.party}"`,
        d.partyCode,
        d.invoiceDate,
        d.dueDate,
        d.total.toFixed(2),
        d.amountPaid.toFixed(2),
        d.amountDue.toFixed(2),
        d.daysOverdue,
        d.agingBucket,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=invoice-aging.csv",
        },
      });
    }

    return NextResponse.json({
      data,
      agingSummary,
      receivables: {
        count: receivables.length,
        total: receivables.reduce((sum, d) => sum + d.amountDue, 0),
      },
      payables: {
        count: payables.length,
        total: payables.reduce((sum, d) => sum + d.amountDue, 0),
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
