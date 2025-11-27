import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@repo/ui/sidebar";
import { ThemeSync } from "@repo/ui/theme-sync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Analytics | TradeSphere",
  description: "Analytics Dashboard Module",
};

// Inline script to prevent theme flash
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('tradesphere-theme') || 'dark';
      document.documentElement.className = theme;
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} flex min-h-screen bg-background`}>
        <ThemeSync />
        <Sidebar basePath="/analytics" />
        <main className="flex-1 ml-64 p-8 bg-muted/20 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
