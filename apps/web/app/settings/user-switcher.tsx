'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { UserCircle, Check, ChevronDown } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserSwitcherProps {
  users: User[];
  currentUserEmail: string;
}

const roleColors: Record<string, string> = {
  ADMIN: 'text-red-400',
  MANAGER: 'text-blue-400',
  OPERATOR: 'text-green-400',
  VIEWER: 'text-gray-400',
};

export function UserSwitcher({ users, currentUserEmail }: UserSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(currentUserEmail);

  const currentUser = users.find(u => u.email === selectedEmail) || users[0];

  const handleUserSelect = (user: User) => {
    setSelectedEmail(user.email);
    // Store selected user in localStorage for demo purposes
    localStorage.setItem('tradesphere-demo-user', user.email);
    setIsOpen(false);
    // Refresh the page to load new user's settings
    router.refresh();
  };

  useEffect(() => {
    // Check if there's a saved demo user
    const savedUser = localStorage.getItem('tradesphere-demo-user');
    if (savedUser && users.find(u => u.email === savedUser)) {
      setSelectedEmail(savedUser);
    }
  }, [users]);

  return (
    <Card className="glass-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-cyan-500" />
          <CardTitle className="text-foreground">Switch User</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Demo mode: Switch between different user accounts to test permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-3 p-3 bg-muted/50 border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-purple-500/50 flex items-center justify-center text-sm font-bold text-foreground">
                {currentUser?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-foreground font-medium">{currentUser?.name}</div>
                <div className="text-xs text-muted-foreground">{currentUser?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${roleColors[currentUser?.role || 'VIEWER']}`}>
                {currentUser?.role}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center justify-between gap-3 p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-foreground">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-foreground text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                    {user.email === selectedEmail && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Note: In production, users would authenticate via a proper login system.
        </p>
      </CardContent>
    </Card>
  );
}
