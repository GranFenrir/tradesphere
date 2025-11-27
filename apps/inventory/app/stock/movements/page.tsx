import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ArrowRightLeft, 
  History,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

const movementTypeConfig = {
  IN: {
    icon: ArrowDownCircle,
    label: "Stock In",
    color: "text-green-400 bg-green-500/10 border-green-500/30",
  },
  OUT: {
    icon: ArrowUpCircle,
    label: "Stock Out",
    color: "text-red-400 bg-red-500/10 border-red-500/30",
  },
  TRANSFER: {
    icon: ArrowRightLeft,
    label: "Transfer",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
};

export default async function MovementsPage() {
  const movements = await prisma.stockMovement.findMany({
    include: {
      product: {
        select: { name: true, sku: true },
      },
      fromLocation: {
        include: {
          warehouse: { select: { name: true } },
        },
      },
      toLocation: {
        include: {
          warehouse: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Last 100 movements
  });

  const stats = {
    total: movements.length,
    in: movements.filter((m) => m.type === "IN").length,
    out: movements.filter((m) => m.type === "OUT").length,
    transfer: movements.filter((m) => m.type === "TRANSFER").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/stock"
            className="text-muted-foreground hover:text-white flex items-center gap-1 mb-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stock
          </Link>
          <h1 className="text-3xl font-bold text-white neon-text">Movement History</h1>
          <p className="text-muted-foreground mt-2">
            Track all stock movements across your warehouses.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/stock/in">
            <Button variant="outline" className="border-green-500/30 hover:bg-green-500/10">
              <ArrowDownCircle className="w-4 h-4 mr-2 text-green-400" />
              Stock In
            </Button>
          </Link>
          <Link href="/stock/out">
            <Button variant="outline" className="border-red-500/30 hover:bg-red-500/10">
              <ArrowUpCircle className="w-4 h-4 mr-2 text-red-400" />
              Stock Out
            </Button>
          </Link>
          <Link href="/stock/transfer">
            <Button variant="outline" className="border-blue-500/30 hover:bg-blue-500/10">
              <ArrowRightLeft className="w-4 h-4 mr-2 text-blue-400" />
              Transfer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowDownCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.in}</p>
                <p className="text-xs text-muted-foreground">Stock In</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.out}</p>
                <p className="text-xs text-muted-foreground">Stock Out</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.transfer}</p>
                <p className="text-xs text-muted-foreground">Transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movements List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {movements.map((movement) => {
              const config = movementTypeConfig[movement.type as keyof typeof movementTypeConfig];
              const Icon = config.icon;

              return (
                <div
                  key={movement.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className={`p-2 rounded-lg border ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{movement.product.name}</span>
                      <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 bg-white/5 rounded">
                        {movement.product.sku}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {movement.type === "IN" && movement.toLocation && (
                        <span>
                          → {movement.toLocation.warehouse.name} / {movement.toLocation.name}
                        </span>
                      )}
                      {movement.type === "OUT" && movement.fromLocation && (
                        <span>
                          ← {movement.fromLocation.warehouse.name} / {movement.fromLocation.name}
                        </span>
                      )}
                      {movement.type === "TRANSFER" && movement.fromLocation && movement.toLocation && (
                        <span>
                          {movement.fromLocation.warehouse.name} / {movement.fromLocation.name}
                          {" → "}
                          {movement.toLocation.warehouse.name} / {movement.toLocation.name}
                        </span>
                      )}
                    </div>
                    {movement.reference && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Ref: {movement.reference}
                      </div>
                    )}
                    {movement.notes && (
                      <div className="mt-1 text-xs text-muted-foreground italic">
                        {movement.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {movement.type === "OUT" ? "-" : "+"}
                      {movement.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            {movements.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No stock movements yet. Record your first movement.
                </p>
                <div className="flex justify-center gap-4 mt-4">
                  <Link href="/stock/in">
                    <Button variant="outline" className="border-green-500/30">
                      <ArrowDownCircle className="w-4 h-4 mr-2 text-green-400" />
                      Stock In
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
