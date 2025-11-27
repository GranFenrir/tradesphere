import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

// Get all BIN locations (for receiving stock)
export async function GET() {
  const locations = await prisma.location.findMany({
    where: { type: "BIN" },
    include: {
      warehouse: {
        select: { name: true, code: true },
      },
    },
    orderBy: [
      { warehouse: { name: "asc" } },
      { code: "asc" },
    ],
  });

  return NextResponse.json(locations);
}
