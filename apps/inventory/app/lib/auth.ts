"use server";

import { auth } from "@/auth";
import { 
  Actions, 
  type Action,
  canPerformAction, 
  AuthorizationError 
} from "@repo/database";

export interface CurrentUser {
  id: string;
  name: string | null | undefined;
  email: string | null | undefined;
  role: string;
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }
  
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role || "VIEWER",
  };
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  return user;
}

/**
 * Require specific action permission - throws if not authorized
 */
export async function requirePermission(action: Action): Promise<CurrentUser> {
  const user = await requireAuth();
  
  if (!canPerformAction(user.role, action)) {
    throw new AuthorizationError(`You do not have permission to perform this action: ${action}`);
  }
  
  return user;
}

/**
 * Check if current user can perform action
 */
export async function checkPermission(action: Action): Promise<boolean> {
  const user = await getCurrentUser();
  return canPerformAction(user?.role, action);
}
