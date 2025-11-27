"use client";

import { useEffect } from "react";

/**
 * ThemeSync component that synchronizes theme across all microfrontend apps.
 * It reads the theme from localStorage and applies it to the document.
 * This runs on every page load to ensure theme consistency.
 */
export function ThemeSync() {
  useEffect(() => {
    // Read theme from localStorage
    const savedTheme = localStorage.getItem("tradesphere-theme");
    const html = document.documentElement;
    
    if (savedTheme === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
      html.classList.remove("light");
    }

    // Listen for storage changes (when theme is changed in another tab/app)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "tradesphere-theme") {
        if (e.newValue === "light") {
          html.classList.add("light");
          html.classList.remove("dark");
        } else {
          html.classList.add("dark");
          html.classList.remove("light");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return null;
}
