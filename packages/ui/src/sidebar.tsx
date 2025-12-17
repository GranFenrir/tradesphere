"use client";

import { usePathname } from "next/navigation";
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
    TrendingUp,
    PieChart,
    DollarSign,
    Users,
    Truck,
    ShoppingCart,
    ClipboardList,
    FileText,
    QrCode,
    Target,
    UserPlus,
    LogOut,
} from "lucide-react";
import { useState } from "react";

// Simple utility for classes
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: NavItem[];
}

const mainNavigation: NavItem[] = [
    { name: "Ana Sayfa", href: "/", icon: LayoutDashboard },
    { name: "Envanter", href: "/inventory", icon: Package },
    { name: "Analitik", href: "/analytics", icon: BarChart3 },
    { name: "Ayarlar", href: "/settings", icon: Settings },
];

// Sub-navigation for inventory module
const inventorySubNav: NavItem[] = [
    { name: "Ürünler", href: "/inventory", icon: Package },
    { name: "Depolar", href: "/inventory/warehouses", icon: Building2 },
    { name: "Konumlar", href: "/inventory/locations", icon: MapPin },
    { 
        name: "Stok", 
        href: "/inventory/stock", 
        icon: Boxes,
        children: [
            { name: "Genel Bakış", href: "/inventory/stock", icon: Boxes },
            { name: "Stok Girişi", href: "/inventory/stock/in", icon: ArrowDownCircle },
            { name: "Stok Çıkışı", href: "/inventory/stock/out", icon: ArrowUpCircle },
            { name: "Transfer", href: "/inventory/stock/transfer", icon: ArrowRightLeft },
            { name: "Geçmiş", href: "/inventory/stock/movements", icon: History },
        ],
    },
    { name: "Parti & Lot", href: "/inventory/batches", icon: QrCode },
    { name: "Tedarikçiler", href: "/inventory/suppliers", icon: Truck },
    { name: "Satın Alma Siparişleri", href: "/inventory/purchase-orders", icon: ClipboardList },
    { name: "Satış Siparişleri", href: "/inventory/sales-orders", icon: ShoppingCart },
    { name: "Faturalar", href: "/inventory/invoices", icon: FileText },
    { 
        name: "CRM", 
        href: "/inventory/crm/leads", 
        icon: Users,
        children: [
            { name: "Potansiyel Müşteriler", href: "/inventory/crm/leads", icon: UserPlus },
            { name: "Fırsatlar", href: "/inventory/crm/opportunities", icon: Target },
        ],
    },
];

// Sub-navigation for analytics module
const analyticsSubNav: NavItem[] = [
    { name: "Genel Bakış", href: "/analytics", icon: PieChart },
    { name: "Stok Sağlığı", href: "/analytics/stock-health", icon: TrendingUp },
    { name: "Finansal", href: "/analytics/financials", icon: DollarSign },
    { name: "Raporlar", href: "/analytics/reports", icon: FileText },
];

// User interface for sidebar
export interface SidebarUser {
    name?: string | null;
    email?: string | null;
    role?: string;
    image?: string | null;
}

export interface SidebarProps {
    basePath?: string;
    user?: SidebarUser | null;
    onLogout?: () => void;
}

export function Sidebar({ basePath = "", user, onLogout }: SidebarProps) {
    const pathname = usePathname();
    // Construct effective path to handle multi-zone basePaths
    const effectivePath = (basePath + (pathname === "/" ? "" : pathname)) || "/";
    
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => ({
        Stok: effectivePath.includes("/stock"),
        CRM: effectivePath.includes("/crm"),
    }));

    const toggleSection = (name: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    // Determine which module we're in
    const isInInventory = effectivePath.startsWith("/inventory");
    const isInAnalytics = effectivePath.startsWith("/analytics");
    
    // Get sub-navigation based on current module
    const subNavigation = isInInventory ? inventorySubNav : isInAnalytics ? analyticsSubNav : null;
    const moduleLabel = isInInventory ? "Envanter Modülü" : isInAnalytics ? "Analitik Modülü" : null;

    const isActive = (href: string) => {
        if (href === "/" || href === "/inventory" || href === "/analytics") {
            return effectivePath === href;
        }
        return effectivePath.startsWith(href);
    };

    return (
        <div className="flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-background/80 backdrop-blur-xl z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    TradeSphere
                </span>
            </div>

            {/* Main Navigation */}
            <nav className="px-4 py-2 space-y-1">
                {mainNavigation.map((item) => {
                    const active = item.href === "/" 
                        ? effectivePath === "/" 
                        : effectivePath.startsWith(item.href);

                    return (
                        <a
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group",
                                active 
                                    ? "bg-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    active ? "text-white" : "group-hover:text-foreground"
                                )}
                            />
                            <span className="font-medium">{item.name}</span>
                        </a>
                    );
                })}
            </nav>

            {/* Sub-Navigation for current module */}
            {subNavigation && (
                <>
                    <div className="px-4 pt-4 pb-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {moduleLabel}
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        {subNavigation.map((item) => {
                            if (item.children) {
                                const isParentActive = effectivePath.startsWith(item.href);
                                return (
                                    <div key={item.name}>
                                        <button
                                            onClick={() => toggleSection(item.name)}
                                            className={cn(
                                                "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all",
                                                isParentActive
                                                    ? "bg-muted text-foreground"
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
                                                    expandedSections[item.name] && "rotate-180"
                                                )}
                                            />
                                        </button>
                                        {expandedSections[item.name] && (
                                            <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                                                {item.children.map((child) => {
                                                    const isChildActive = isActive(child.href);
                                                    return (
                                                        <a
                                                            key={child.href}
                                                            href={child.href}
                                                            className={cn(
                                                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                                                                isChildActive
                                                                    ? "bg-primary/80 text-white"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                            )}
                                                        >
                                                            <child.icon className="w-3.5 h-3.5" />
                                                            <span>{child.name}</span>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            const active = isActive(item.href);
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                                        active
                                            ? "bg-primary/80 text-white"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </a>
                            );
                        })}
                    </nav>
                </>
            )}

            {/* Spacer when no sub-nav */}
            {!subNavigation && <div className="flex-1" />}

            {user && (
                <div className="p-4 border-t border-border">
                    <div className="glass-card p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg text-sm">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name || "User"}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                user.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2) || "U"
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-foreground truncate">
                                {user.name || "Kullanıcı"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : "Kullanıcı"}
                            </p>
                        </div>
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Çıkış yap"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
