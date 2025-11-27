import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET() {
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  return NextResponse.json(warehouses);
}
