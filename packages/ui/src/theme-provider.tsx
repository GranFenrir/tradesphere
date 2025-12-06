"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ============================================
// THEME TYPES & CONSTANTS
// ============================================

export type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "tradesphere-theme";

// ============================================
// THEME CONTEXT
// ============================================

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook to access theme context.
 * Returns default values if used outside of ThemeProvider (SSR safety).
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return safe defaults for SSR or when used outside provider
    return {
      theme: "dark",
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}

// ============================================
// THEME PROVIDER
// ============================================

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

/**
 * ThemeProvider component that manages theme state across the application.
 * 
 * Features:
 * - Persists theme choice to localStorage
 * - Syncs theme across tabs via storage events
 * - Applies theme class to document root
 * - Prevents hydration mismatch
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * <ThemeProvider>
 *   {children}
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, defaultTheme = "dark" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      setThemeState(savedTheme);
    }
  }, []);

  // Apply theme class to document and persist to localStorage
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    
    // Apply theme class
    if (theme === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
      html.classList.remove("light");
    }

    // Persist to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, mounted]);

  // Listen for theme changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (newTheme === "dark" || newTheme === "light") {
          setThemeState(newTheme);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Prevent hydration mismatch by not rendering context until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// THEME SYNC (for sub-apps without full provider)
// ============================================

/**
 * ThemeSync component for sub-apps that don't need the full ThemeProvider.
 * 
 * Use this in microfrontend sub-apps (inventory, analytics) that:
 * - Don't have their own theme settings UI
 * - Just need to read and apply the theme set by the main app
 * 
 * For apps with theme settings UI, use ThemeProvider instead.
 */
export function ThemeSync() {
  useEffect(() => {
    const html = document.documentElement;
    
    // Read and apply theme from localStorage
    const applyTheme = () => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light") {
        html.classList.add("light");
        html.classList.remove("dark");
      } else {
        html.classList.add("dark");
        html.classList.remove("light");
      }
    };

    applyTheme();

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) {
        applyTheme();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return null;
}
