'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, useTheme, type Theme } from '@repo/ui/theme-provider';

// Re-export theme hooks from shared package
export { useTheme, type Theme } from '@repo/ui/theme-provider';

// ============================================
// USER CONTEXT
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  // Return default values if not within provider (SSR safety)
  if (!context) {
    return { user: null, setUser: () => {} };
  }
  return context;
}

// ============================================
// USER PROVIDER (internal)
// ============================================

function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('tradesphere-current-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  const setUserAndPersist = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('tradesphere-current-user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('tradesphere-current-user');
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <UserContext.Provider value={{ user, setUser: setUserAndPersist }}>
      {children}
    </UserContext.Provider>
  );
}

// ============================================
// COMBINED PROVIDER
// ============================================

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root provider that combines ThemeProvider (from shared UI) and UserProvider.
 * Use this in the web app's layout.tsx.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <UserProvider>
        {children}
      </UserProvider>
    </ThemeProvider>
  );
}
