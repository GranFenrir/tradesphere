import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';

// Export auth utilities
export * from './auth';

// Type constants (SQLite doesn't support enums)
export const LocationType = {
  ZONE: 'ZONE',
  RACK: 'RACK',
  SHELF: 'SHELF',
  BIN: 'BIN',
} as const;

export type LocationType = (typeof LocationType)[keyof typeof LocationType];

export const MovementType = {
  IN: 'IN',
  OUT: 'OUT',
  TRANSFER: 'TRANSFER',
} as const;

export type MovementType = (typeof MovementType)[keyof typeof MovementType];

export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Purchase Order Status
export const POStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  CONFIRMED: 'CONFIRMED',
  PARTIAL: 'PARTIAL',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED',
} as const;

export type POStatus = (typeof POStatus)[keyof typeof POStatus];

// Sales Order Status
export const OrderStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// Invoice Status
export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

// Invoice Type
export const InvoiceType = {
  SALES: 'SALES',
  PURCHASE: 'PURCHASE',
  CREDIT_NOTE: 'CREDIT_NOTE',
  DEBIT_NOTE: 'DEBIT_NOTE',
} as const;

export type InvoiceType = (typeof InvoiceType)[keyof typeof InvoiceType];

// Payment Method
export const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  CHECK: 'CHECK',
  OTHER: 'OTHER',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// Batch Quality Status
export const QualityStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  QUARANTINE: 'QUARANTINE',
} as const;

export type QualityStatus = (typeof QualityStatus)[keyof typeof QualityStatus];

// Serial Number Status
export const SerialStatus = {
  IN_STOCK: 'IN_STOCK',
  SOLD: 'SOLD',
  RETURNED: 'RETURNED',
  DEFECTIVE: 'DEFECTIVE',
  RESERVED: 'RESERVED',
} as const;

export type SerialStatus = (typeof SerialStatus)[keyof typeof SerialStatus];

// CRM - Lead Status
export const LeadStatus = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  UNQUALIFIED: 'UNQUALIFIED',
  CONVERTED: 'CONVERTED',
} as const;

export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

// CRM - Lead Source
export const LeadSource = {
  WEBSITE: 'WEBSITE',
  REFERRAL: 'REFERRAL',
  COLD_CALL: 'COLD_CALL',
  TRADE_SHOW: 'TRADE_SHOW',
  SOCIAL_MEDIA: 'SOCIAL_MEDIA',
  OTHER: 'OTHER',
} as const;

export type LeadSource = (typeof LeadSource)[keyof typeof LeadSource];

// CRM - Lead Rating
export const LeadRating = {
  HOT: 'HOT',
  WARM: 'WARM',
  COLD: 'COLD',
} as const;

export type LeadRating = (typeof LeadRating)[keyof typeof LeadRating];

// CRM - Opportunity Stage
export const OpportunityStage = {
  PROSPECTING: 'PROSPECTING',
  QUALIFICATION: 'QUALIFICATION',
  PROPOSAL: 'PROPOSAL',
  NEGOTIATION: 'NEGOTIATION',
  CLOSED_WON: 'CLOSED_WON',
  CLOSED_LOST: 'CLOSED_LOST',
} as const;

export type OpportunityStage = (typeof OpportunityStage)[keyof typeof OpportunityStage];

// CRM - Activity Type
export const ActivityType = {
  CALL: 'CALL',
  EMAIL: 'EMAIL',
  MEETING: 'MEETING',
  TASK: 'TASK',
  NOTE: 'NOTE',
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];
