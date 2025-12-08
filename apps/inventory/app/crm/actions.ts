"use server";

import { prisma, LeadStatus, LeadSource, OpportunityStage, ActivityType } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ============================================
// LEAD ACTIONS
// ============================================

export async function createLead(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const company = formData.get("company") as string | null;
  const jobTitle = formData.get("jobTitle") as string | null;
  const source = formData.get("source") as string;
  const rating = formData.get("rating") as string | null;
  const estimatedValue = formData.get("estimatedValue") as string | null;
  const notes = formData.get("notes") as string | null;

  const lead = await prisma.lead.create({
    data: {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      company: company || null,
      jobTitle: jobTitle || null,
      source: source || LeadSource.WEBSITE,
      rating: rating || null,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
      notes: notes || null,
      status: LeadStatus.NEW,
    },
  });

  revalidatePath("/crm/leads");
  redirect(`/crm/leads/${lead.id}`);
}

export async function updateLeadStatus(id: string, status: string) {
  await prisma.lead.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${id}`);
}

export async function updateLeadRating(id: string, rating: string) {
  await prisma.lead.update({
    where: { id },
    data: { rating },
  });

  revalidatePath(`/crm/leads/${id}`);
}

export async function convertLeadToCustomer(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) throw new Error("Lead not found");

  // Generate customer code
  const count = await prisma.customer.count();
  const code = `CUST-${String(count + 1).padStart(5, "0")}`;

  // Create customer and update lead in transaction
  const [customer] = await prisma.$transaction([
    prisma.customer.create({
      data: {
        name: `${lead.firstName} ${lead.lastName}`,
        code,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        contactName: `${lead.firstName} ${lead.lastName}`,
      },
    }),
    prisma.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.CONVERTED,
        convertedDate: new Date(),
      },
    }),
  ]);

  // Link converted customer to lead
  await prisma.lead.update({
    where: { id: leadId },
    data: { convertedToCustomerId: customer.id },
  });

  revalidatePath("/crm/leads");
  redirect(`/crm/leads/${leadId}`);
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({
    where: { id },
  });

  revalidatePath("/crm/leads");
  redirect("/crm/leads");
}

// ============================================
// OPPORTUNITY ACTIONS
// ============================================

export async function createOpportunity(formData: FormData) {
  const name = formData.get("name") as string;
  const customerId = formData.get("customerId") as string | null;
  const amount = parseFloat(formData.get("amount") as string);
  const probability = parseInt(formData.get("probability") as string) || 0;
  const expectedCloseDate = formData.get("expectedCloseDate") as string | null;
  const description = formData.get("description") as string | null;
  const notes = formData.get("notes") as string | null;

  const opportunity = await prisma.opportunity.create({
    data: {
      name,
      customerId: customerId || null,
      amount,
      probability,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      description: description || null,
      notes: notes || null,
      stage: OpportunityStage.PROSPECTING,
    },
  });

  revalidatePath("/crm/opportunities");
  redirect(`/crm/opportunities/${opportunity.id}`);
}

export async function updateOpportunityStage(id: string, stage: string, lostReason?: string) {
  await prisma.opportunity.update({
    where: { id },
    data: {
      stage,
      actualCloseDate:
        stage === OpportunityStage.CLOSED_WON || stage === OpportunityStage.CLOSED_LOST
          ? new Date()
          : null,
      lostReason:
        stage === OpportunityStage.CLOSED_LOST ? lostReason || null : null,
    },
  });

  revalidatePath("/crm/opportunities");
  revalidatePath(`/crm/opportunities/${id}`);
}

export async function updateOpportunityProbability(id: string, probability: number) {
  await prisma.opportunity.update({
    where: { id },
    data: { probability },
  });

  revalidatePath(`/crm/opportunities/${id}`);
}

export async function deleteOpportunity(id: string) {
  await prisma.opportunity.delete({
    where: { id },
  });

  revalidatePath("/crm/opportunities");
  redirect("/crm/opportunities");
}

// ============================================
// ACTIVITY ACTIONS
// ============================================

export async function createActivity(formData: FormData) {
  const type = formData.get("type") as string;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string | null;
  const dueDate = formData.get("dueDate") as string | null;
  const duration = formData.get("duration") as string | null;
  const leadId = formData.get("leadId") as string | null;
  const opportunityId = formData.get("opportunityId") as string | null;
  const customerId = formData.get("customerId") as string | null;

  await prisma.activity.create({
    data: {
      type: type || ActivityType.TASK,
      subject,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      duration: duration ? parseInt(duration) : null,
      leadId: leadId || null,
      opportunityId: opportunityId || null,
      customerId: customerId || null,
    },
  });

  if (leadId) revalidatePath(`/crm/leads/${leadId}`);
  if (opportunityId) revalidatePath(`/crm/opportunities/${opportunityId}`);
}

export async function completeActivity(id: string) {
  await prisma.activity.update({
    where: { id },
    data: {
      isCompleted: true,
      completedDate: new Date(),
    },
  });

  revalidatePath("/crm");
}
