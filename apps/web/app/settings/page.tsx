import { prisma } from "@repo/database";
import { cookies } from "next/headers";
import { SettingsForm } from "./settings-form";
import { UserSwitcher } from "./user-switcher";

// Get current user from cookie or default
async function getCurrentUserEmail(): Promise<string> {
  // In a real app, this would come from auth session
  // For demo, we use a default user
  return "emre.demir@tradesphere.com";
}

export default async function SettingsPage() {
  const currentUserEmail = await getCurrentUserEmail();
  
  // Get all users for the switcher
  const allUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });

  const user = await prisma.user.findUnique({
    where: { email: currentUserEmail },
  });

  if (!user) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white neon-text">Settings</h1>
          <p className="text-muted-foreground mt-2">User not found. Please contact administrator.</p>
        </div>
        {allUsers.length > 0 && (
          <UserSwitcher users={allUsers} currentUserEmail={currentUserEmail} />
        )}
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
        <h1 className="text-3xl font-bold text-white neon-text">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and system settings.</p>
      </div>

      {/* User Switcher for Demo */}
      <UserSwitcher users={allUsers} currentUserEmail={user.email} />

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
