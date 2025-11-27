"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  Globe,
  Building2,
  MapPin,
  Boxes,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  History,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// Main navigation (cross-app)
const mainNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Inventory sub-navigation
const inventoryNavigation = [
  { name: "Products", href: "/", icon: Package },
  { name: "Warehouses", href: "/warehouses", icon: Building2 },
  { name: "Locations", href: "/locations", icon: MapPin },
  {
    name: "Stock",
    href: "/stock",
    icon: Boxes,
    children: [
      { name: "Overview", href: "/stock", icon: Boxes },
      { name: "Stock In", href: "/stock/in", icon: ArrowDownCircle },
      { name: "Stock Out", href: "/stock/out", icon: ArrowUpCircle },
      { name: "Transfer", href: "/stock/transfer", icon: ArrowRightLeft },
      { name: "History", href: "/stock/movements", icon: History },
    ],
  },
];

export function InventorySidebar() {
  const pathname = usePathname();
  const [stockOpen, setStockOpen] = useState(pathname.startsWith("/stock"));

  const isInventoryActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-background/80 backdrop-blur-xl z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          TradeSphere
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="px-4 py-2">
        <div className="flex gap-1">
          {mainNavigation.map((item) => {
            const isActive =
              item.href === "/inventory"
                ? true
                : item.href === "/"
                ? pathname === "/" && !pathname.startsWith("/inventory")
                : pathname.startsWith(item.href);

            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-center p-2 rounded-lg transition-all",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                title={item.name}
              >
                <item.icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>
      </nav>

      <div className="px-4 py-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Inventory Module
        </div>
      </div>

      {/* Inventory Sub-Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {inventoryNavigation.map((item) => {
          if (item.children) {
            const isParentActive = pathname.startsWith(item.href);
            return (
              <div key={item.name}>
                <button
                  onClick={() => setStockOpen(!stockOpen)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all",
                    isParentActive
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      stockOpen && "rotate-180"
                    )}
                  />
                </button>
                {stockOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                    {item.children.map((child) => {
                      const isChildActive =
                        child.href === "/stock"
                          ? pathname === "/stock"
                          : pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                            isChildActive
                              ? "bg-primary text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <child.icon className="w-3.5 h-3.5" />
                          <span>{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = isInventoryActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                isActive
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
            ED
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">Emre Demir</p>
            <p className="text-xs text-muted-foreground truncate">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
