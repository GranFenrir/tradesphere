import { NextRequest, NextResponse } from "next/server";
import { prisma, MovementType } from "@repo/database";

interface MovementData {
  id: string;
  type: string;
  productName: string;
  productSku: string;
  fromLocation: string | null;
  toLocation: string | null;
  quantity: number;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const productId = searchParams.get("productId");
  const warehouseId = searchParams.get("warehouseId");
  const type = searchParams.get("type") as string | null;

  try {
    const whereClause: Record<string, unknown> = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        (whereClause.createdAt as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (whereClause.createdAt as Record<string, unknown>).lte = end;
      }
    }

    if (productId) {
      whereClause.productId = productId;
    }

    if (warehouseId) {
      whereClause.OR = [
        { fromLocationId: warehouseId },
        { toLocationId: warehouseId },
      ];
    }

    if (type && Object.values(MovementType).includes(type as MovementType)) {
      whereClause.type = type;
    }

    const movements = await prisma.stockMovement.findMany({
      where: whereClause,
      include: {
        product: { select: { name: true, sku: true } },
        fromLocation: { select: { name: true } },
        toLocation: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 1000, // Limit to prevent performance issues
    });

    const data: MovementData[] = movements.map((movement) => ({
      id: movement.id,
      type: movement.type,
      productName: movement.product.name,
      productSku: movement.product.sku,
      fromLocation: movement.fromLocation?.name ?? null,
      toLocation: movement.toLocation?.name ?? null,
      quantity: movement.quantity,
      reference: movement.reference,
      notes: movement.notes,
      createdAt: movement.createdAt.toISOString().split("T")[0]!,
    }));

    // Summary by movement type
    const summary = {
      inbound: movements.filter((m) => m.type === MovementType.IN).length,
      outbound: movements.filter((m) => m.type === MovementType.OUT).length,
      transfer: movements.filter((m) => m.type === MovementType.TRANSFER).length,
      totalMovements: movements.length,
      totalQuantityMoved: movements.reduce((sum, m) => sum + m.quantity, 0),
    };

    if (format === "csv") {
      const headers = [
        "Date",
        "Type",
        "Product",
        "SKU",
        "From Location",
        "To Location",
        "Quantity",
        "Reference",
        "Notes",
      ];
      const rows = data.map((d) => [
        d.createdAt,
        d.type,
        `"${d.productName}"`,
        d.productSku,
        d.fromLocation ?? "",
        d.toLocation ?? "",
        d.quantity,
        d.reference ?? "",
        `"${d.notes ?? ""}"`,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=stock-movements.csv",
        },
      });
    }

    return NextResponse.json({
      data,
      summary,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
