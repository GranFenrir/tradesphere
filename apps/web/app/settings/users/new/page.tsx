'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { ChevronLeft, Loader2, UserPlus } from "lucide-react";
import { createUser } from '../../../actions';

const roles = [
  { value: 'ADMIN', label: 'Administrator', description: 'Full system access' },
  { value: 'MANAGER', label: 'Manager', description: 'Manage inventory and reports' },
  { value: 'OPERATOR', label: 'Operator', description: 'Day-to-day operations' },
  { value: 'VIEWER', label: 'Viewer', description: 'Read-only access' },
];

export default function NewUserPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('OPERATOR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    startTransition(async () => {
      try {
        await createUser({ name, email, role });
        router.push('/settings/users');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create user');
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/settings/users">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Users
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Add New User</h1>
          <p className="text-muted-foreground mt-1">Create a new team member account.</p>
        </div>
      </div>

      <Card className="glass-card border-border max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <CardTitle className="text-foreground">User Details</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Enter the information for the new user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@tradesphere.com"
                className="bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Role *</label>
              <div className="grid gap-2">
                {roles.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      role === r.value
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={(e) => setRole(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      role === r.value ? 'border-primary' : 'border-white/30'
                    }`}>
                      {role === r.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <div className="text-foreground font-medium">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create User
              </Button>
              <Link href="/settings/users">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
