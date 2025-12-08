import { NextRequest, NextResponse } from "next/server";
import { prisma, OrderStatus } from "@repo/database";

interface PurchaseData {
  orderNumber: string;
  supplierName: string;
  supplierCode: string;
  orderDate: string;
  expectedDate: string | null;
  status: string;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const status = searchParams.get("status");
  const supplierId = searchParams.get("supplierId");

  try {
    const whereClause: Record<string, unknown> = {};

    if (startDate || endDate) {
      whereClause.orderDate = {};
      if (startDate) {
        (whereClause.orderDate as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (whereClause.orderDate as Record<string, unknown>).lte = end;
      }
    }

    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      whereClause.status = status;
    }

    if (supplierId) {
      whereClause.supplierId = supplierId;
    }

    const orders = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        supplier: { select: { name: true, code: true } },
        items: { select: { quantity: true } },
      },
      orderBy: { orderDate: "desc" },
    });

    const data: PurchaseData[] = orders.map((order) => ({
      orderNumber: order.orderNumber,
      supplierName: order.supplier.name,
      supplierCode: order.supplier.code,
      orderDate: order.orderDate.toISOString().split("T")[0]!,
      expectedDate: order.expectedDate?.toISOString().split("T")[0] ?? null,
      status: order.status,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
    }));

    // Summary statistics
    const receivedOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED);
    const pendingOrders = orders.filter(
      (o) =>
        o.status === OrderStatus.PENDING ||
        o.status === OrderStatus.CONFIRMED ||
        o.status === OrderStatus.SHIPPED
    );

    const summary = {
      totalOrders: orders.length,
      totalSpend: data.reduce((sum, d) => sum + d.total, 0),
      receivedOrders: receivedOrders.length,
      receivedValue: receivedOrders.reduce((sum, o) => sum + Number(o.total), 0),
      pendingOrders: pendingOrders.length,
      pendingValue: pendingOrders.reduce((sum, o) => sum + Number(o.total), 0),
      averageOrderValue: data.length > 0
        ? data.reduce((sum, d) => sum + d.total, 0) / data.length
        : 0,
      cancelledOrders: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
    };

    // Top suppliers
    const supplierTotals = new Map<string, { name: string; total: number; orders: number }>();
    data.forEach((d) => {
      const existing = supplierTotals.get(d.supplierCode);
      if (existing) {
        existing.total += d.total;
        existing.orders += 1;
      } else {
        supplierTotals.set(d.supplierCode, { name: d.supplierName, total: d.total, orders: 1 });
      }
    });
    const topSuppliers = Array.from(supplierTotals.entries())
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    if (format === "csv") {
      const headers = [
        "Order #",
        "Supplier",
        "Supplier Code",
        "Order Date",
        "Expected Date",
        "Status",
        "Items",
        "Subtotal",
        "Tax",
        "Total",
      ];
      const rows = data.map((d) => [
        d.orderNumber,
        `"${d.supplierName}"`,
        d.supplierCode,
        d.orderDate,
        d.expectedDate ?? "",
        d.status,
        d.itemCount,
        d.subtotal.toFixed(2),
        d.tax.toFixed(2),
        d.total.toFixed(2),
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=purchase-report.csv",
        },
      });
    }

    return NextResponse.json({
      data,
      summary,
      topSuppliers,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
