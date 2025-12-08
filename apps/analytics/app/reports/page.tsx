"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Truck,
  BarChart3,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  category: string;
  endpoint: string;
}

const reports: ReportConfig[] = [
  {
    id: "inventory-valuation",
    name: "Inventory Valuation",
    description: "Current value of all inventory by product, including cost and retail value",
    icon: Package,
    category: "Inventory",
    endpoint: "/api/reports/inventory-valuation",
  },
  {
    id: "stock-levels",
    name: "Stock Levels",
    description: "Current stock levels with reorder point and max stock comparisons",
    icon: BarChart3,
    category: "Inventory",
    endpoint: "/api/reports/stock-levels",
  },
  {
    id: "low-stock",
    name: "Low Stock Alert",
    description: "Products at or below reorder point requiring attention",
    icon: TrendingUp,
    category: "Inventory",
    endpoint: "/api/reports/low-stock",
  },
  {
    id: "expiring-batches",
    name: "Expiring Batches",
    description: "Batches expiring within the next 30, 60, or 90 days",
    icon: Calendar,
    category: "Inventory",
    endpoint: "/api/reports/expiring-batches",
  },
  {
    id: "sales-summary",
    name: "Sales Summary",
    description: "Sales orders summary by status, customer, and time period",
    icon: DollarSign,
    category: "Sales",
    endpoint: "/api/reports/sales-summary",
  },
  {
    id: "customer-analysis",
    name: "Customer Analysis",
    description: "Customer order history and total revenue by customer",
    icon: Users,
    category: "Sales",
    endpoint: "/api/reports/customer-analysis",
  },
  {
    id: "purchase-summary",
    name: "Purchase Summary",
    description: "Purchase orders summary by status, supplier, and time period",
    icon: Truck,
    category: "Purchasing",
    endpoint: "/api/reports/purchase-summary",
  },
  {
    id: "supplier-performance",
    name: "Supplier Performance",
    description: "Supplier delivery times, order volumes, and pricing analysis",
    icon: Truck,
    category: "Purchasing",
    endpoint: "/api/reports/supplier-performance",
  },
  {
    id: "invoice-aging",
    name: "Invoice Aging",
    description: "Outstanding invoices by aging bucket (0-30, 31-60, 61-90, 90+ days)",
    icon: FileText,
    category: "Finance",
    endpoint: "/api/reports/invoice-aging",
  },
  {
    id: "revenue-report",
    name: "Revenue Report",
    description: "Revenue and profit analysis by product and time period",
    icon: DollarSign,
    category: "Finance",
    endpoint: "/api/reports/revenue",
  },
];

const categories = ["All", "Inventory", "Sales", "Purchasing", "Finance"];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [generating, setGenerating] = useState<string | null>(null);

  const filteredReports =
    selectedCategory === "All"
      ? reports
      : reports.filter((r) => r.category === selectedCategory);

  const handleExport = async (report: ReportConfig, format: "csv" | "json") => {
    setGenerating(report.id);
    try {
      const params = new URLSearchParams({
        format,
        ...(dateRange.from && { from: dateRange.from }),
        ...(dateRange.to && { to: dateRange.to }),
      });

      const response = await fetch(`${report.endpoint}?${params}`);
      
      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.id}-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate and export business reports
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="flex gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          const isGenerating = generating === report.id;

          return (
            <Card key={report.id} className="glass-card hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-muted/30 rounded-full text-muted-foreground">
                    {report.category}
                  </span>
                </div>
                <CardTitle className="text-lg mt-3">{report.name}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isGenerating}
                    onClick={() => handleExport(report, "csv")}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating..." : "CSV"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isGenerating}
                    onClick={() => handleExport(report, "json")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating..." : "JSON"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Report Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>CSV format</strong> is best for importing into spreadsheet applications
                like Excel or Google Sheets.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>JSON format</strong> is ideal for integrating with other systems or
                programmatic analysis.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Use <strong>date filters</strong> to narrow down reports to specific time periods.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Reports are generated in real-time with the latest data from your database.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
