import { prisma } from "@repo/database";
import { SettingsForm } from "./settings-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white neon-text">Ayarlar</h1>
          <p className="text-muted-foreground mt-2">Kullanıcı bulunamadı. Lütfen yöneticiyle iletişime geçin.</p>
        </div>
      </div>
    );
  }

  // Parse preferences
  let preferences = null;
  if (user.preferences) {
    try {
      preferences = JSON.parse(user.preferences);
    } catch {
      preferences = null;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white neon-text">Ayarlar</h1>
        <p className="text-muted-foreground mt-2">Hesap tercihlerinizi ve sistem ayarlarınızı yönetin.</p>
      </div>

      <SettingsForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          preferences,
        }}
      />
    </div>
  );
}
