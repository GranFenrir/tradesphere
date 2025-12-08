import { auth } from "@/auth";
import { SidebarWrapper } from "../components/sidebar-wrapper";
import { prisma } from "@repo/database";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
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
        {children}
      </main>
    </div>
  );
}
