import { NextResponse } from "next/server";
import { prisma, LeadStatus } from "@repo/database";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: leads.length,
      new: leads.filter((l) => l.status === LeadStatus.NEW).length,
      qualified: leads.filter((l) => l.status === LeadStatus.QUALIFIED).length,
      converted: leads.filter((l) => l.status === LeadStatus.CONVERTED).length,
      totalValue: leads
        .filter((l) => l.status !== LeadStatus.CONVERTED && l.status !== LeadStatus.UNQUALIFIED)
        .reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0),
    };

    // Convert Decimal to number for JSON
    const serializedLeads = leads.map((l) => ({
      ...l,
      estimatedValue: l.estimatedValue ? Number(l.estimatedValue) : null,
    }));

    return NextResponse.json({ leads: serializedLeads, stats });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
