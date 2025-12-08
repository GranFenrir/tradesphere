import { NextResponse } from "next/server";
import { prisma, QualityStatus } from "@repo/database";

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        location: {
          select: { id: true, name: true, code: true },
        },
        supplier: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const stats = {
      totalBatches: batches.length,
      expiringWithin30Days: batches.filter(
        (b) =>
          b.expiryDate &&
          new Date(b.expiryDate) <= thirtyDaysFromNow &&
          new Date(b.expiryDate) > now
      ).length,
      expired: batches.filter(
        (b) => b.expiryDate && new Date(b.expiryDate) < now
      ).length,
      quarantined: batches.filter((b) => b.qualityStatus === QualityStatus.QUARANTINE)
        .length,
    };

    return NextResponse.json({ batches, stats });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}
