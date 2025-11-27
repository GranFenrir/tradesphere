import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

// Get all BIN locations with their current stock
export async function GET() {
  const locations = await prisma.location.findMany({
    where: { type: "BIN" },
    include: {
      warehouse: {
        select: { name: true, code: true },
      },
      stockItems: {
        select: {
          productId: true,
          quantity: true,
        },
      },
    },
    orderBy: [
      { warehouse: { name: "asc" } },
      { code: "asc" },
    ],
  });

  return NextResponse.json(locations);
}
