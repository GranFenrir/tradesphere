"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  customer: { name: string; code: string } | null;
  supplier: { name: string; code: string } | null;
}

interface Stats {
  total: number;
  draft: number;
  sent: number;
  overdue: number;
  totalReceivable: number;
  totalPayable: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  DRAFT: { label: "Taslak", color: "bg-gray-500/20 text-gray-400", icon: FileText },
  SENT: { label: "Gönderildi", color: "bg-blue-500/20 text-blue-400", icon: ArrowUpRight },
  PAID: { label: "Ödendi", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  PARTIAL: { label: "Kısmi", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  OVERDUE: { label: "Gecikmiş", color: "bg-red-500/20 text-red-400", icon: AlertTriangle },
  CANCELLED: { label: "İptal", color: "bg-gray-500/20 text-gray-400", icon: FileText },
  REFUNDED: { label: "İade Edildi", color: "bg-purple-500/20 text-purple-400", icon: ArrowDownLeft },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    draft: 0,
    sent: 0,
    overdue: 0,
    totalReceivable: 0,
    totalPayable: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sales" | "purchase">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/inventory/api/invoices");
        const data = await res.json();
        setInvoices(data.invoices);
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "sales" && inv.type !== "SALES") return false;
    if (filter === "purchase" && inv.type !== "PURCHASE") return false;
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.customer?.name.toLowerCase().includes(searchLower) ||
        inv.supplier?.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faturalar</h1>
          <p className="text-muted-foreground mt-1">
            Satış faturalarını ve alış faturalarını yönetin
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/invoices/new?type=purchase">
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Yeni Alış Faturası
            </Link>
          </Button>
          <Button asChild>
            <Link href="/invoices/new?type=sales">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Satış Faturası
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.draft} drafts, {stats.sent} pending
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accounts Receivable
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(stats.totalReceivable)}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding from customers</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accounts Payable
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(stats.totalPayable)}
            </div>
            <p className="text-xs text-muted-foreground">Owed to suppliers</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "sales" | "purchase")}
            className="px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="all">All Types</option>
            <option value="sales">Sales Invoices</option>
            <option value="purchase">Purchase Bills</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoice List */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Invoice #
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Customer/Supplier
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Due Date
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Due
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const config = statusConfig[invoice.status] ?? statusConfig.DRAFT!;
                    const Icon = config.icon;
                    return (
                      <tr
                        key={invoice.id}
                        className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {invoice.invoiceNumber}
                          </Link>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.type === "SALES"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {invoice.type === "SALES" ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3" />
                            )}
                            {invoice.type === "SALES" ? "Invoice" : "Bill"}
                          </span>
                        </td>
                        <td className="p-4 text-foreground">
                          {invoice.customer?.name || invoice.supplier?.name || "—"}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {formatDate(invoice.invoiceDate)}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="p-4 text-right font-medium text-foreground">
                          {formatCurrency(invoice.total)}
                        </td>
                        <td className="p-4 text-right font-medium">
                          <span
                            className={
                              invoice.amountDue > 0 ? "text-red-400" : "text-green-400"
                            }
                          >
                            {formatCurrency(invoice.amountDue)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
