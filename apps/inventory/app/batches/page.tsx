"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Boxes,
  QrCode,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

interface Batch {
  id: string;
  batchNumber: string;
  manufactureDate: string | null;
  expiryDate: string | null;
  receivedDate: string;
  initialQty: number;
  currentQty: number;
  qualityStatus: string;
  product: { name: string; sku: string };
  location: { name: string; code: string } | null;
  supplier: { name: string } | null;
}

interface Stats {
  totalBatches: number;
  expiringWithin30Days: number;
  expired: number;
  quarantined: number;
}

const qualityConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  PENDING: { label: "Pending Review", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "bg-red-500/20 text-red-400", icon: AlertTriangle },
  QUARANTINE: { label: "Quarantine", color: "bg-orange-500/20 text-orange-400", icon: AlertTriangle },
};

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBatches: 0,
    expiringWithin30Days: 0,
    expired: 0,
    quarantined: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/inventory/api/batches");
        const data = await res.json();
        setBatches(data.batches);
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching batches:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredBatches = batches.filter((batch) => {
    if (statusFilter !== "all" && batch.qualityStatus !== statusFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        batch.batchNumber.toLowerCase().includes(searchLower) ||
        batch.product.name.toLowerCase().includes(searchLower) ||
        batch.product.sku.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry > new Date();
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
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
          <h1 className="text-3xl font-bold text-foreground">Batch & Lot Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track batches, lots, and expiry dates for inventory items
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/batches/serial-numbers">
              <QrCode className="w-4 h-4 mr-2" />
              Serial Numbers
            </Link>
          </Button>
          <Button asChild>
            <Link href="/batches/new">
              <Plus className="w-4 h-4 mr-2" />
              New Batch
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Batches
            </CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalBatches}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expiring Soon
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.expiringWithin30Days}
            </div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Requires disposal</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quarantined
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{stats.quarantined}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search batches by number, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="QUARANTINE">Quarantine</option>
        </select>
      </div>

      {/* Batch List */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Batch #
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Location
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Manufacture
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Expiry
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      No batches found
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => {
                    const config = qualityConfig[batch.qualityStatus] ?? qualityConfig.PENDING!;
                    const Icon = config.icon;
                    const expired = isExpired(batch.expiryDate);
                    const expiringSoon = isExpiringSoon(batch.expiryDate);

                    return (
                      <tr
                        key={batch.id}
                        className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/batches/${batch.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {batch.batchNumber}
                          </Link>
                        </td>
                        <td className="p-4">
                          <p className="text-foreground">{batch.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {batch.product.sku}
                          </p>
                        </td>
                        <td className="p-4 text-foreground">
                          {batch.location?.name ?? "—"}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {formatDate(batch.manufactureDate)}
                        </td>
                        <td className="p-4">
                          <span
                            className={
                              expired
                                ? "text-red-400 font-medium"
                                : expiringSoon
                                ? "text-yellow-400"
                                : "text-muted-foreground"
                            }
                          >
                            {formatDate(batch.expiryDate)}
                            {expired && " (Expired)"}
                            {expiringSoon && !expired && " ⚠️"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-foreground font-medium">
                            {batch.currentQty}
                          </span>
                          <span className="text-muted-foreground">
                            /{batch.initialQty}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
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
