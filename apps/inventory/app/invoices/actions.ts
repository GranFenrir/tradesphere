"use server";

import { prisma, InvoiceStatus, InvoiceType, PaymentMethod } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createInvoice(formData: FormData) {
  const type = formData.get("type") as string;
  const customerId = formData.get("customerId") as string | null;
  const supplierId = formData.get("supplierId") as string | null;
  const dueDate = formData.get("dueDate") as string;
  const taxRate = formData.get("taxRate") as string;
  const notes = formData.get("notes") as string | null;
  const terms = formData.get("terms") as string | null;

  // Generate invoice number
  const count = await prisma.invoice.count();
  const prefix = type === InvoiceType.SALES ? "INV" : "BILL";
  const invoiceNumber = `${prefix}-${String(count + 1).padStart(5, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      type,
      status: InvoiceStatus.DRAFT,
      dueDate: new Date(dueDate),
      taxRate: parseFloat(taxRate) || 0,
      customerId: customerId || null,
      supplierId: supplierId || null,
      notes: notes || null,
      terms: terms || null,
    },
  });

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoiceStatus(id: string, status: string) {
  await prisma.invoice.update({
    where: { id },
    data: { 
      status,
      paidDate: status === InvoiceStatus.PAID ? new Date() : undefined,
    },
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function addInvoiceItem(invoiceId: string, formData: FormData) {
  const productId = formData.get("productId") as string | null;
  const description = formData.get("description") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const unitPrice = parseFloat(formData.get("unitPrice") as string);
  const taxRate = parseFloat(formData.get("taxRate") as string) || 0;

  const taxAmount = (quantity * unitPrice * taxRate) / 100;
  const total = quantity * unitPrice + taxAmount;

  await prisma.invoiceItem.create({
    data: {
      invoiceId,
      productId: productId || null,
      description,
      quantity,
      unitPrice,
      taxRate,
      taxAmount,
      total,
    },
  });

  // Recalculate invoice totals
  await recalculateInvoiceTotal(invoiceId);

  revalidatePath(`/invoices/${invoiceId}`);
}

export async function removeInvoiceItem(itemId: string, invoiceId: string) {
  await prisma.invoiceItem.delete({
    where: { id: itemId },
  });

  await recalculateInvoiceTotal(invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function recordPayment(invoiceId: string, formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const method = formData.get("method") as string;
  const reference = formData.get("reference") as string | null;
  const notes = formData.get("notes") as string | null;

  // Generate payment number
  const count = await prisma.payment.count();
  const paymentNumber = `PAY-${String(count + 1).padStart(5, "0")}`;

  await prisma.payment.create({
    data: {
      paymentNumber,
      invoiceId,
      amount,
      method: method || PaymentMethod.BANK_TRANSFER,
      reference: reference || null,
      notes: notes || null,
    },
  });

  // Update invoice amounts
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (invoice) {
    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const amountDue = Number(invoice.total) - totalPaid;

    let newStatus = invoice.status;
    if (amountDue <= 0) {
      newStatus = InvoiceStatus.PAID;
    } else if (totalPaid > 0) {
      newStatus = InvoiceStatus.PARTIAL;
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: totalPaid,
        amountDue: Math.max(0, amountDue),
        status: newStatus,
        paidDate: newStatus === InvoiceStatus.PAID ? new Date() : null,
      },
    });
  }

  revalidatePath(`/invoices/${invoiceId}`);
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({
    where: { id },
  });

  revalidatePath("/invoices");
  redirect("/invoices");
}

async function recalculateInvoiceTotal(invoiceId: string) {
  const items = await prisma.invoiceItem.findMany({
    where: { invoiceId },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0
  );
  const taxAmount = items.reduce((sum, item) => sum + Number(item.taxAmount), 0);
  const total = subtotal + taxAmount;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { discount: true, amountPaid: true },
  });

  const discount = Number(invoice?.discount || 0);
  const amountPaid = Number(invoice?.amountPaid || 0);
  const finalTotal = total - discount;
  const amountDue = finalTotal - amountPaid;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      subtotal,
      taxAmount,
      total: finalTotal,
      amountDue: Math.max(0, amountDue),
    },
  });
}
