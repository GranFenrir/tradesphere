/**
 * Shared Authorization Utilities
 * 
 * Role-based access control for TradeSphere ERP
 */

// Define UserRole locally to avoid circular dependency with index.ts
const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
} as const;

// Permission levels (higher = more permissions)
const ROLE_LEVELS: Record<string, number> = {
  [UserRole.ADMIN]: 100,
  [UserRole.MANAGER]: 75,
  [UserRole.OPERATOR]: 50,
  [UserRole.VIEWER]: 25,
};

// Action categories
export const Actions = {
  // Product actions
  CREATE_PRODUCT: "CREATE_PRODUCT",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",
  VIEW_PRODUCT: "VIEW_PRODUCT",

  // Stock actions
  STOCK_IN: "STOCK_IN",
  STOCK_OUT: "STOCK_OUT",
  STOCK_TRANSFER: "STOCK_TRANSFER",
  VIEW_STOCK: "VIEW_STOCK",

  // Warehouse/Location actions
  MANAGE_WAREHOUSE: "MANAGE_WAREHOUSE",
  MANAGE_LOCATION: "MANAGE_LOCATION",
  VIEW_WAREHOUSE: "VIEW_WAREHOUSE",

  // Order actions
  CREATE_ORDER: "CREATE_ORDER",
  UPDATE_ORDER: "UPDATE_ORDER",
  DELETE_ORDER: "DELETE_ORDER",
  VIEW_ORDER: "VIEW_ORDER",

  // Invoice actions
  CREATE_INVOICE: "CREATE_INVOICE",
  UPDATE_INVOICE: "UPDATE_INVOICE",
  DELETE_INVOICE: "DELETE_INVOICE",
  VIEW_INVOICE: "VIEW_INVOICE",
  RECORD_PAYMENT: "RECORD_PAYMENT",

  // CRM actions
  MANAGE_LEADS: "MANAGE_LEADS",
  MANAGE_OPPORTUNITIES: "MANAGE_OPPORTUNITIES",
  VIEW_CRM: "VIEW_CRM",

  // Batch actions
  MANAGE_BATCHES: "MANAGE_BATCHES",
  VIEW_BATCHES: "VIEW_BATCHES",

  // Supplier actions
  MANAGE_SUPPLIERS: "MANAGE_SUPPLIERS",
  VIEW_SUPPLIERS: "VIEW_SUPPLIERS",

  // User management
  MANAGE_USERS: "MANAGE_USERS",
  VIEW_USERS: "VIEW_USERS",

  // Settings
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
} as const;

export type Action = (typeof Actions)[keyof typeof Actions];

// Define which roles can perform which actions
const ACTION_PERMISSIONS: Record<Action, string[]> = {
  // Products - ADMIN, MANAGER can create/update/delete, OPERATOR can update, everyone can view
  [Actions.CREATE_PRODUCT]: [UserRole.ADMIN, UserRole.MANAGER],
  [Actions.UPDATE_PRODUCT]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  [Actions.DELETE_PRODUCT]: [UserRole.ADMIN, UserRole.MANAGER],
  [Actions.VIEW_PRODUCT]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER],

  // Stock - ADMIN, MANAGER, OPERATOR can manage stock
  [Actions.STOCK_IN]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  [Actions.STOCK_OUT]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  [Actions.STOCK_TRANSFER]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  [Actions.VIEW_STOCK]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER],

  // Warehouses/Locations - ADMIN, MANAGER can manage
  [Actions.MANAGE_WAREHOUSE]: [UserRole.ADMIN, UserRole.MANAGER],
  [Actions.MANAGE_LOCATION]: [UserRole.ADMIN, UserRole.MANAGER],
  [Actions.VIEW_WAREHOUSE]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER],

  // Orders - ADMIN, MANAGER can create/update/delete, OPERATOR can create/update
  [Actions.CREATE_ORDER]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  [Actions.UPDATE_ORDER]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  [Actions.DELETE_ORDER]: [UserRole.ADMIN, UserRole.MANAGER],
  [Actions.VIEW_ORDER]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER],

  // Invoices - ADMIN, MANAGER can manage
  [Actions.CREATE_INVOICE]: [UserRole.ADMIN, UserRole.MANAGER],
  [Actions.UPDATE_INVOICE]: [UserRole.ADMIN, UserRole.MANAGER],
  [Actions.DELETE_INVOICE]: [UserRole.ADMIN],
  [Actions.VIEW_INVOICE]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER],
  [Actions.RECORD_PAYMENT]: [UserRole.ADMIN, UserRole.MANAGER],

  // CRM
  [Actions.MANAGE_LEADS]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  [Actions.MANAGE_OPPORTUNITIES]: [UserRole.ADMIN, UserRole.MANAGER],
  [Actions.VIEW_CRM]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER],

  // Batches
  [Actions.MANAGE_BATCHES]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  [Actions.VIEW_BATCHES]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER],

  // Suppliers
  [Actions.MANAGE_SUPPLIERS]: [UserRole.ADMIN, UserRole.MANAGER],
  [Actions.VIEW_SUPPLIERS]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER],

  // User management - ADMIN only
  [Actions.MANAGE_USERS]: [UserRole.ADMIN],
  [Actions.VIEW_USERS]: [UserRole.ADMIN, UserRole.MANAGER],

  // Settings
  [Actions.MANAGE_SETTINGS]: [UserRole.ADMIN],
};

/**
 * Check if a role can perform a specific action
 */
export function canPerformAction(role: string | undefined | null, action: Action): boolean {
  if (!role) return false;
  const allowedRoles = ACTION_PERMISSIONS[action];
  return allowedRoles?.includes(role) ?? false;
}

/**
 * Check if a role has at least the specified minimum role level
 */
export function hasMinimumRole(role: string | undefined | null, minimumRole: string): boolean {
  if (!role) return false;
  const userLevel = ROLE_LEVELS[role] ?? 0;
  const requiredLevel = ROLE_LEVELS[minimumRole] ?? 100;
  return userLevel >= requiredLevel;
}

/**
 * Check if a role is admin
 */
export function isAdmin(role: string | undefined | null): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if a role is at least manager
 */
export function isManagerOrAbove(role: string | undefined | null): boolean {
  return hasMinimumRole(role, UserRole.MANAGER);
}

/**
 * Check if a role is at least operator
 */
export function isOperatorOrAbove(role: string | undefined | null): boolean {
  return hasMinimumRole(role, UserRole.OPERATOR);
}

/**
 * Check if role is viewer only (read-only access)
 */
export function isViewerOnly(role: string | undefined | null): boolean {
  return role === UserRole.VIEWER;
}

/**
 * Authorization error class
 */
export class AuthorizationError extends Error {
  constructor(message: string = "You do not have permission to perform this action") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Assert that a role can perform an action, throw if not
 */
export function assertCanPerform(role: string | undefined | null, action: Action): void {
  if (!canPerformAction(role, action)) {
    throw new AuthorizationError();
  }
}
