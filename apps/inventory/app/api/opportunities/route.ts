import { NextResponse } from "next/server";
import { prisma, OpportunityStage } from "@repo/database";

export async function GET() {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        customer: {
          select: { id: true, name: true, code: true },
        },
        assignedTo: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const openStages = [
      OpportunityStage.PROSPECTING,
      OpportunityStage.QUALIFICATION,
      OpportunityStage.PROPOSAL,
      OpportunityStage.NEGOTIATION,
    ] as string[];

    const openOpportunities = opportunities.filter((o) => openStages.includes(o.stage));
    const wonOpportunities = opportunities.filter((o) => o.stage === OpportunityStage.CLOSED_WON);
    const lostOpportunities = opportunities.filter((o) => o.stage === OpportunityStage.CLOSED_LOST);

    const stats = {
      total: opportunities.length,
      openValue: openOpportunities.reduce((sum, o) => sum + Number(o.amount), 0),
      wonValue: wonOpportunities.reduce((sum, o) => sum + Number(o.amount), 0),
      lostValue: lostOpportunities.reduce((sum, o) => sum + Number(o.amount), 0),
      avgProbability:
        openOpportunities.length > 0
          ? openOpportunities.reduce((sum, o) => sum + o.probability, 0) / openOpportunities.length
          : 0,
    };

    // Convert Decimal to number for JSON
    const serializedOpportunities = opportunities.map((o) => ({
      ...o,
      amount: Number(o.amount),
    }));

    return NextResponse.json({ opportunities: serializedOpportunities, stats });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}
