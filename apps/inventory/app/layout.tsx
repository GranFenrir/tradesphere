import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@repo/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory | TradeSphere",
  description: "Inventory Management Module",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen bg-background`}>
        <Sidebar basePath="/inventory" />
        <main className="flex-1 ml-64 p-8 bg-muted/20 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
