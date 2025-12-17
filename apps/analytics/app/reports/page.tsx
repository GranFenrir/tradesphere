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
    name: "Envanter Değerlemesi",
    description: "Maliyet ve perakende değeri dahil, ürüne göre tüm envanterin mevcut değeri",
    icon: Package,
    category: "Envanter",
    endpoint: "/api/reports/inventory-valuation",
  },
  {
    id: "stock-levels",
    name: "Stok Seviyeleri",
    description: "Yeniden sipariş noktası ve maksimum stok karşılaştırmalarıyla mevcut stok seviyeleri",
    icon: BarChart3,
    category: "Envanter",
    endpoint: "/api/reports/stock-levels",
  },
  {
    id: "low-stock",
    name: "Düşük Stok Uyarısı",
    description: "Yeniden sipariş noktasında veya altında ilgi gerektiren ürünler",
    icon: TrendingUp,
    category: "Envanter",
    endpoint: "/api/reports/low-stock",
  },
  {
    id: "expiring-batches",
    name: "Süresi Dolan Partiler",
    description: "Önümüzdeki 30, 60 veya 90 gün içinde süresi dolacak partiler",
    icon: Calendar,
    category: "Envanter",
    endpoint: "/api/reports/expiring-batches",
  },
  {
    id: "sales-summary",
    name: "Satış Özeti",
    description: "Durum, müşteri ve zaman dilimine göre satış siparişleri özeti",
    icon: DollarSign,
    category: "Satış",
    endpoint: "/api/reports/sales-summary",
  },
  {
    id: "customer-analysis",
    name: "Müşteri Analizi",
    description: "Müşteri sipariş geçmişi ve müşteriye göre toplam gelir",
    icon: Users,
    category: "Satış",
    endpoint: "/api/reports/customer-analysis",
  },
  {
    id: "purchase-summary",
    name: "Satın Alma Özeti",
    description: "Durum, tedarikçi ve zaman dilimine göre satın alma siparişleri özeti",
    icon: Truck,
    category: "Satın Alma",
    endpoint: "/api/reports/purchase-summary",
  },
  {
    id: "supplier-performance",
    name: "Tedarikçi Performansı",
    description: "Tedarikçi teslimat süreleri, sipariş hacimleri ve fiyatlama analizi",
    icon: Truck,
    category: "Satın Alma",
    endpoint: "/api/reports/supplier-performance",
  },
  {
    id: "invoice-aging",
    name: "Fatura Yaşlandırması",
    description: "Yaşlandırma dönemine göre ödenmemiş faturalar (0-30, 31-60, 61-90, 90+ gün)",
    icon: FileText,
    category: "Finans",
    endpoint: "/api/reports/invoice-aging",
  },
  {
    id: "revenue-report",
    name: "Gelir Raporu",
    description: "Ürün ve zaman dilimine göre gelir ve kâr analizi",
    icon: DollarSign,
    category: "Finans",
    endpoint: "/api/reports/revenue",
  },
];

const categories = ["Tümü", "Envanter", "Satış", "Satın Alma", "Finans"];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [generating, setGenerating] = useState<string | null>(null);

  const filteredReports =
    selectedCategory === "Tümü"
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
      
      if (!response.ok) throw new Error("Rapor oluşturulamadı");

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
      console.error("Rapor oluşturma hatası:", error);
      alert("Rapor oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Raporlar</h1>
        <p className="text-muted-foreground mt-1">
          İş raporları oluşturun ve dışa aktarın
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Rapor Filtreleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Kategori
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
                  Başlangıç Tarihi
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
                  Bitiş Tarihi
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
                    {isGenerating ? "Oluşturuluyor..." : "CSV"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isGenerating}
                    onClick={() => handleExport(report, "json")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isGenerating ? "Oluşturuluyor..." : "JSON"}
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
          <CardTitle>Rapor İpuçları</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>CSV formatı</strong> Excel veya Google Sheets gibi elektronik tablo
                uygulamalarına aktarmak için en iyisidir.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                <strong>JSON formatı</strong> diğer sistemlerle entegrasyon veya
                programatik analiz için idealdir.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Raporları belirli zaman dilimlerine daraltmak için <strong>tarih filtrelerini</strong> kullanın.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Raporlar veritabanınızdaki en güncel verilerle anlık olarak oluşturulur.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
