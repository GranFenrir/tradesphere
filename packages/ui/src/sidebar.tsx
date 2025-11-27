"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, BarChart3, Settings, Globe } from "lucide-react";

// Simple utility for classes
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ basePath = "" }: { basePath?: string }) {
    const pathname = usePathname();
    // Construct effective path to handle multi-zone basePaths
    const effectivePath = (basePath + (pathname === "/" ? "" : pathname)) || "/";

    return (
        <div className="flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/10 bg-background/80 backdrop-blur-xl z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                    TradeSphere
                </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                    const isActive = item.href === "/" 
                        ? effectivePath === "/" 
                        : effectivePath.startsWith(item.href);

                    return (
                        <a
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                isActive 
                                    ? "bg-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-white" : "group-hover:text-white"
                                )}
                            />
                            <span className="font-medium">{item.name}</span>
                        </a>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="glass-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
                        ED
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Emre Demir</p>
                        <p className="text-xs text-muted-foreground truncate">Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
