import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@repo/ui/sidebar";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradeSphere ERP",
  description: "Modern Microfrontend ERP",
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} flex min-h-screen bg-background`}>
        <Providers>
          <Sidebar />
          <main className="flex-1 ml-64 p-8 bg-muted/20 min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
