"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

interface Opportunity {
  id: string;
  name: string;
  stage: string;
  probability: number;
  amount: number;
  expectedCloseDate: string | null;
  customer: { name: string; code: string } | null;
  assignedTo: { name: string } | null;
  createdAt: string;
}

interface Stats {
  total: number;
  openValue: number;
  wonValue: number;
  lostValue: number;
  avgProbability: number;
}

const stageConfig: Record<string, { label: string; color: string; progress: number }> = {
  PROSPECTING: { label: "Araştırma", color: "bg-gray-500/20 text-gray-400", progress: 10 },
  QUALIFICATION: { label: "Değerlendirme", color: "bg-blue-500/20 text-blue-400", progress: 25 },
  PROPOSAL: { label: "Teklif", color: "bg-purple-500/20 text-purple-400", progress: 50 },
  NEGOTIATION: { label: "Müzakere", color: "bg-yellow-500/20 text-yellow-400", progress: 75 },
  CLOSED_WON: { label: "Kazanıldı", color: "bg-green-500/20 text-green-400", progress: 100 },
  CLOSED_LOST: { label: "Kaybedildi", color: "bg-red-500/20 text-red-400", progress: 0 },
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    openValue: 0,
    wonValue: 0,
    lostValue: 0,
    avgProbability: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/inventory/api/opportunities");
        const data = await res.json();
        setOpportunities(data.opportunities);
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching opportunities:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredOpportunities = opportunities.filter((opp) => {
    if (stageFilter !== "all" && opp.stage !== stageFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        opp.name.toLowerCase().includes(searchLower) ||
        opp.customer?.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
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
          <h1 className="text-3xl font-bold text-foreground">Fırsatlar</h1>
          <p className="text-muted-foreground mt-1">
            Satış hattınızdaki anlaşmaları takip edin
          </p>
        </div>
        <Button asChild>
          <Link href="/crm/opportunities/new">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Fırsat
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Anlaşma
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Açık Pipeline
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(stats.openValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kazanılan
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(stats.wonValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kaybedilen
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(stats.lostValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ort. Olasılık
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.avgProbability.toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="İsim, müşteri ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          <option value="all">Tüm Aşamalar</option>
          <option value="PROSPECTING">Araştırma</option>
          <option value="QUALIFICATION">Değerlendirme</option>
          <option value="PROPOSAL">Teklif</option>
          <option value="NEGOTIATION">Müzakere</option>
          <option value="CLOSED_WON">Kazanıldı</option>
          <option value="CLOSED_LOST">Kaybedildi</option>
        </select>
      </div>

      {/* Opportunity List */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Fırsat
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Müşteri
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Aşama
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Tutar
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Olasılık
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Beklenen Kapanış
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Atanan
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOpportunities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      Fırsat bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredOpportunities.map((opp) => {
                    const config = stageConfig[opp.stage] ?? stageConfig.PROSPECTING!;

                    return (
                      <tr
                        key={opp.id}
                        className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/crm/opportunities/${opp.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {opp.name}
                          </Link>
                        </td>
                        <td className="p-4 text-foreground">
                          {opp.customer?.name ?? "—"}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                            >
                              {config.label}
                            </span>
                            <div className="w-full bg-muted/30 rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{ width: `${config.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right font-medium text-foreground">
                          {formatCurrency(opp.amount)}
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={
                              opp.probability >= 70
                                ? "text-green-400"
                                : opp.probability >= 40
                                ? "text-yellow-400"
                                : "text-muted-foreground"
                            }
                          >
                            {opp.probability}%
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {formatDate(opp.expectedCloseDate)}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {opp.assignedTo?.name ?? "Atanmamış"}
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
