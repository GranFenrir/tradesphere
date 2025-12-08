import { NextRequest, NextResponse } from "next/server";
import { prisma, OrderStatus } from "@repo/database";

interface SalesData {
  orderNumber: string;
  customerName: string;
  customerCode: string;
  orderDate: string;
  status: string;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: string | null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const status = searchParams.get("status");
  const customerId = searchParams.get("customerId");

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

    if (customerId) {
      whereClause.customerId = customerId;
    }

    const orders = await prisma.salesOrder.findMany({
      where: whereClause,
      include: {
        customer: { select: { name: true, code: true } },
        items: { select: { quantity: true } },
      },
      orderBy: { orderDate: "desc" },
    });

    const data: SalesData[] = orders.map((order) => ({
      orderNumber: order.orderNumber,
      customerName: order.customer?.name ?? "Unknown",
      customerCode: order.customer?.code ?? "",
      orderDate: order.orderDate.toISOString().split("T")[0]!,
      status: order.status,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
      shippingAddress: order.shippingAddress,
    }));

    // Summary statistics
    const completedOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED);
    const pendingOrders = orders.filter(
      (o) => o.status === OrderStatus.PENDING || o.status === OrderStatus.CONFIRMED
    );

    const summary = {
      totalOrders: orders.length,
      totalRevenue: data.reduce((sum, d) => sum + d.total, 0),
      completedOrders: completedOrders.length,
      completedRevenue: completedOrders.reduce((sum, o) => sum + Number(o.total), 0),
      pendingOrders: pendingOrders.length,
      pendingValue: pendingOrders.reduce((sum, o) => sum + Number(o.total), 0),
      averageOrderValue: data.length > 0 
        ? data.reduce((sum, d) => sum + d.total, 0) / data.length 
        : 0,
      cancelledOrders: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
    };

    // Top customers
    const customerTotals = new Map<string, { name: string; total: number; orders: number }>();
    data.forEach((d) => {
      const existing = customerTotals.get(d.customerCode);
      if (existing) {
        existing.total += d.total;
        existing.orders += 1;
      } else {
        customerTotals.set(d.customerCode, { name: d.customerName, total: d.total, orders: 1 });
      }
    });
    const topCustomers = Array.from(customerTotals.entries())
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    if (format === "csv") {
      const headers = [
        "Order #",
        "Customer",
        "Customer Code",
        "Order Date",
        "Status",
        "Items",
        "Subtotal",
        "Tax",
        "Total",
      ];
      const rows = data.map((d) => [
        d.orderNumber,
        `"${d.customerName}"`,
        d.customerCode,
        d.orderDate,
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
          "Content-Disposition": "attachment; filename=sales-report.csv",
        },
      });
    }

    return NextResponse.json({
      data,
      summary,
      topCustomers,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
