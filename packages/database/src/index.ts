import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';

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
