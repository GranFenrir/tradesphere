'use client';

import { ReactNode } from 'react';
import { ThemeProvider, useTheme, type Theme } from '@repo/ui/theme-provider';

// Re-export theme hooks from shared package
export { useTheme, type Theme } from '@repo/ui/theme-provider';

// ============================================
// COMBINED PROVIDER
// ============================================

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root provider that combines ThemeProvider.
 * Authentication is handled by NextAuth.js (see auth.ts).
 * Use this in the web app's layout.tsx.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      {children}
    </ThemeProvider>
  );
}
