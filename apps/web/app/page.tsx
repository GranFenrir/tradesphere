import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Activity, CreditCard, DollarSign, Users, ArrowUpRight } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground neon-text">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$45,231.89</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">+2350</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">+12,234</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">+573</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Overview</CardTitle>
            <CardDescription className="text-muted-foreground">Monthly revenue breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-end justify-between gap-2 pt-4 px-4">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                <div key={i} className="w-full bg-primary/20 rounded-t-sm relative group overflow-hidden" style={{ height: `${h}%` }}>
                  <div className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-500 h-0 group-hover:h-full opacity-50"></div>
                  <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-primary/50 to-transparent"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Sales</CardTitle>
            <CardDescription className="text-muted-foreground">You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+$1,999.00" },
                { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+$39.00" },
                { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+$299.00" },
                { name: "William Kim", email: "will@email.com", amount: "+$99.00" },
                { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+$39.00" }
              ].map((sale, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground mr-4">
                    {sale.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{sale.name}</p>
                    <p className="text-sm text-muted-foreground">{sale.email}</p>
                  </div>
                  <div className="ml-auto font-medium text-foreground">{sale.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
