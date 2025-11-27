'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { ChevronLeft, Loader2, User, Trash2 } from "lucide-react";
import { getUser, updateUser, deleteUser } from '../../../actions';

const roles = [
  { value: 'ADMIN', label: 'Administrator', description: 'Full system access' },
  { value: 'MANAGER', label: 'Manager', description: 'Manage inventory and reports' },
  { value: 'OPERATOR', label: 'Operator', description: 'Day-to-day operations' },
  { value: 'VIEWER', label: 'Viewer', description: 'Read-only access' },
];

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('OPERATOR');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser(userId);
      if (userData) {
        setUser(userData);
        setName(userData.name);
        setEmail(userData.email);
        setRole(userData.role);
        setIsActive(userData.isActive);
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    startTransition(async () => {
      try {
        await updateUser(userId, { name, email, role, isActive });
        router.push('/settings/users');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update user');
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteUser(userId);
        router.push('/settings/users');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">User Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested user could not be found.</p>
        </div>
        <Link href="/settings/users">
          <Button>Back to Users</Button>
        </Link>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-foreground neon-text">Edit User</h1>
          <p className="text-muted-foreground mt-1">Update user information and permissions.</p>
        </div>
      </div>

      <Card className="glass-card border-border max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle className="text-foreground">User Details</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Modify the user&apos;s information.
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
                className="bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
              <div>
                <div className="text-foreground font-medium">Active Status</div>
                <div className="text-xs text-muted-foreground">Deactivated users cannot log in</div>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  isActive ? 'bg-green-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                  isActive ? 'right-1 bg-white' : 'left-1 bg-white/50'
                }`} />
              </button>
            </div>

            <div className="flex justify-between pt-4">
              <div className="flex gap-3">
                <Button type="submit" disabled={isPending} className="gap-2">
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </Button>
                <Link href="/settings/users">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-400">Are you sure?</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    Yes, Delete
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
