import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Activity, CreditCard, DollarSign, Users, ArrowUpRight } from "lucide-react";
import { auth } from "@/auth";
import { SidebarWrapper } from "./components/sidebar-wrapper";
import { prisma } from "@repo/database";

export default async function Page() {
  const session = await auth();
  
  // Get user role from database
  const dbUser = session?.user?.email 
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } })
    : null;

  const sidebarUser = session?.user ? {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: dbUser?.role || "USER",
  } : null;

  return (
    <div className="flex min-h-screen">
      <SidebarWrapper user={sidebarUser} />
      <main className="flex-1 ml-64 p-8 bg-muted/20 min-h-screen">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground neon-text">Kontrol Paneli</h1>
            <p className="text-muted-foreground mt-2">
              Tekrar hoş geldiniz, {session?.user?.name || "Kullanıcı"}. İşte bugün neler oluyor.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Gelir</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(452318.9)}</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> Geçen aya göre +%20,1
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Abonelikler</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">+2350</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> Geçen aya göre +%180,1
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Satışlar</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">+12.234</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> Geçen aya göre +%19
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-red-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Kullanıcı</CardTitle>
                <Activity className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">+573</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> Son saatten bu yana +201
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Genel Bakış</CardTitle>
                <CardDescription className="text-muted-foreground">Aylık gelir dağılımı.</CardDescription>
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
                <CardTitle className="text-foreground">Son Satışlar</CardTitle>
                <CardDescription className="text-muted-foreground">Bu ay 265 satış yaptınız.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {[
                    { name: "Ayşe Yılmaz", email: "ayse.yilmaz@email.com", amount: "+₺19.990,00" },
                    { name: "Mehmet Kaya", email: "mehmet.kaya@email.com", amount: "+₺390,00" },
                    { name: "Zeynep Demir", email: "zeynep.demir@email.com", amount: "+₺2.990,00" },
                    { name: "Ali Çelik", email: "ali.celik@email.com", amount: "+₺990,00" },
                    { name: "Fatma Özkan", email: "fatma.ozkan@email.com", amount: "+₺390,00" }
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
      </main>
    </div>
  );
}
