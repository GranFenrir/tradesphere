'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ============================================
// THEME CONTEXT
// ============================================

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  // Return default values if not within provider (SSR safety)
  if (!context) {
    return { theme: 'dark' as Theme, setTheme: () => {} };
  }
  return context;
}

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
// COMBINED PROVIDER
// ============================================

interface ProvidersProps {
  children: ReactNode;
  initialTheme?: Theme;
  initialUser?: User | null;
}

export function Providers({ children, initialTheme = 'dark', initialUser = null }: ProvidersProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [user, setUser] = useState<User | null>(initialUser);
  const [mounted, setMounted] = useState(false);

  // Apply theme on mount and changes
  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('tradesphere-theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    // Check localStorage for saved user
    const savedUser = localStorage.getItem('tradesphere-current-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme class to html element
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('light');
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
      html.classList.remove('light');
    }
    // Save to localStorage
    localStorage.setItem('tradesphere-theme', theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setUserAndPersist = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('tradesphere-current-user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('tradesphere-current-user');
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ user, setUser: setUserAndPersist }}>
        {children}
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}
