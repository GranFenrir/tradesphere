"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  UserPlus,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  source: string;
  rating: string | null;
  estimatedValue: number | null;
  assignedTo: { name: string } | null;
  createdAt: string;
}

interface Stats {
  total: number;
  new: number;
  qualified: number;
  converted: number;
  totalValue: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-500/20 text-blue-400" },
  CONTACTED: { label: "Contacted", color: "bg-purple-500/20 text-purple-400" },
  QUALIFIED: { label: "Qualified", color: "bg-green-500/20 text-green-400" },
  UNQUALIFIED: { label: "Unqualified", color: "bg-gray-500/20 text-gray-400" },
  CONVERTED: { label: "Converted", color: "bg-emerald-500/20 text-emerald-400" },
};

const ratingConfig: Record<string, { label: string; color: string }> = {
  HOT: { label: "🔥 Hot", color: "text-red-400" },
  WARM: { label: "☀️ Warm", color: "text-yellow-400" },
  COLD: { label: "❄️ Cold", color: "text-blue-400" },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    new: 0,
    qualified: 0,
    converted: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/inventory/api/leads");
        const data = await res.json();
        setLeads(data.leads);
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== "all" && lead.status !== statusFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Track and nurture potential customers
          </p>
        </div>
        <Button asChild>
          <Link href="/crm/leads/new">
            <UserPlus className="w-4 h-4 mr-2" />
            New Lead
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New
            </CardTitle>
            <Star className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.new}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qualified
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.qualified}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Converted
            </CardTitle>
            <ArrowRight className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{stats.converted}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.totalValue)}
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
            placeholder="Search by name, email, company..."
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
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="UNQUALIFIED">Unqualified</option>
          <option value="CONVERTED">Converted</option>
        </select>
      </div>

      {/* Lead List */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Company
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Contact
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Rating
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Est. Value
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Assigned
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const config = statusConfig[lead.status] ?? statusConfig.NEW!;
                    const rating = lead.rating ? ratingConfig[lead.rating] : null;

                    return (
                      <tr
                        key={lead.id}
                        className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/crm/leads/${lead.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {lead.firstName} {lead.lastName}
                          </Link>
                        </td>
                        <td className="p-4 text-foreground">
                          {lead.company || "—"}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {rating && (
                            <span className={rating.color}>{rating.label}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </td>
                        <td className="p-4 text-right font-medium text-foreground">
                          {formatCurrency(lead.estimatedValue)}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {lead.assignedTo?.name ?? "Unassigned"}
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
