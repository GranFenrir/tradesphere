import { prisma, UserRole } from "@repo/database";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Users, Plus, Shield, ShieldCheck, Eye, Wrench, ChevronLeft } from "lucide-react";

const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: <ShieldCheck className="w-4 h-4 text-red-400" />,
  MANAGER: <Shield className="w-4 h-4 text-blue-400" />,
  OPERATOR: <Wrench className="w-4 h-4 text-green-400" />,
  VIEWER: <Eye className="w-4 h-4 text-gray-400" />,
};

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
  MANAGER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  OPERATOR: 'bg-green-500/10 text-green-400 border-green-500/20',
  VIEWER: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground neon-text">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage team members and their permissions.</p>
          </div>
        </div>
        <Link href="/settings/users/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="glass-card border-border hover:border-white/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/50 to-purple-500/50 flex items-center justify-center text-lg font-bold text-foreground">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground font-medium">{user.name}</h3>
                      {!user.isActive && (
                        <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 ${roleColors[user.role]}`}>
                    {roleIcons[user.role]}
                    {user.role}
                  </span>
                  <Link href={`/settings/users/${user.id}`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="glass-card border-border">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-foreground font-medium mb-2">No users yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Add your first team member to get started.</p>
            <Link href="/settings/users/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
