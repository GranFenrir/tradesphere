'use server';

import { prisma, UserRole } from '@repo/database';
import { revalidatePath } from 'next/cache';

// ============================================
// USER ACTIONS
// ============================================

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: {
  email: string;
  name: string;
  role?: string;
  avatar?: string;
}) {
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role || UserRole.OPERATOR,
      avatar: data.avatar,
      preferences: JSON.stringify({ theme: 'dark', notifications: { email: true, push: false } }),
    },
  });
  revalidatePath('/settings/users');
  return user;
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
    isActive?: boolean;
  }
) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
  revalidatePath('/settings/users');
  revalidatePath('/settings');
  return user;
}

export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id },
  });
  revalidatePath('/settings/users');
}

// ============================================
// USER PREFERENCES
// ============================================

interface UserPreferences {
  theme: 'dark' | 'light';
  notifications: {
    email: boolean;
    push: boolean;
  };
  language?: string;
  timezone?: string;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  
  if (!user?.preferences) return null;
  
  try {
    return JSON.parse(user.preferences) as UserPreferences;
  } catch {
    return null;
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  
  let currentPrefs: UserPreferences = {
    theme: 'dark',
    notifications: { email: true, push: false },
  };
  
  if (user?.preferences) {
    try {
      currentPrefs = JSON.parse(user.preferences);
    } catch {
      // Use defaults
    }
  }
  
  const newPrefs = {
    ...currentPrefs,
    ...preferences,
    notifications: {
      ...currentPrefs.notifications,
      ...(preferences.notifications || {}),
    },
  };
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      preferences: JSON.stringify(newPrefs),
      updatedAt: new Date(),
    },
  });
  
  revalidatePath('/settings');
  return newPrefs;
}

// ============================================
// PROFILE ACTIONS (for current user)
// ============================================

export async function updateProfile(
  userId: string,
  data: { name?: string; email?: string }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
  revalidatePath('/settings');
  return user;
}
