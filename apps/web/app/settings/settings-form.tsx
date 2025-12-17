'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { User, Bell, Palette, Check, Loader2, Users, ChevronRight } from "lucide-react";
import { updateProfile, updateUserPreferences } from '../actions';
import { useTheme } from '../providers';

interface SettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    preferences: {
      theme: 'dark' | 'light';
      notifications: {
        email: boolean;
        push: boolean;
      };
    } | null;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const { theme: currentTheme, setTheme: setGlobalTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [theme, setTheme] = useState<'dark' | 'light'>(user.preferences?.theme || 'dark');
  const [emailNotif, setEmailNotif] = useState(user.preferences?.notifications?.email ?? true);
  const [pushNotif, setPushNotif] = useState(user.preferences?.notifications?.push ?? false);

  // Sync with global theme on mount
  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const showSaved = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  const handleProfileSave = () => {
    startTransition(async () => {
      await updateProfile(user.id, { name, email });
      showSaved('profile');
    });
  };

  const handleNotificationToggle = (type: 'email' | 'push') => {
    const newValue = type === 'email' ? !emailNotif : !pushNotif;
    if (type === 'email') setEmailNotif(newValue);
    else setPushNotif(newValue);
    
    startTransition(async () => {
      await updateUserPreferences(user.id, {
        notifications: {
          email: type === 'email' ? newValue : emailNotif,
          push: type === 'push' ? newValue : pushNotif,
        },
      });
      showSaved('notifications');
    });
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    setGlobalTheme(newTheme); // Update global theme context
    startTransition(async () => {
      await updateUserPreferences(user.id, { theme: newTheme });
      showSaved('appearance');
    });
  };

  return (
    <div className="grid gap-6">
      {/* Profile Settings */}
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle className="text-foreground">Profil Ayarları</CardTitle>
            </div>
            {saved === 'profile' && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <Check className="w-3 h-3" /> Kaydedildi
              </span>
            )}
          </div>
          <CardDescription className="text-muted-foreground">Kişisel bilgilerinizi güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Görünen Ad</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-md"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">E-posta</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-md"
            />
          </div>
          <Button onClick={handleProfileSave} disabled={isPending} className="mt-2">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Değişiklikleri Kaydet
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-foreground">Bildirimler</CardTitle>
            </div>
            {saved === 'notifications' && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <Check className="w-3 h-3" /> Kaydedildi
              </span>
            )}
          </div>
          <CardDescription className="text-muted-foreground">Uyarıları nasıl alacağınızı yapılandırın.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-foreground">E-posta Bildirimleri</span>
            <button
              onClick={() => handleNotificationToggle('email')}
              className={`w-10 h-6 rounded-full relative transition-colors ${
                emailNotif ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                emailNotif ? 'right-1 bg-white' : 'left-1 bg-muted-foreground'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2 pt-4">
            <span className="text-sm text-foreground">Anlık Bildirimler</span>
            <button
              onClick={() => handleNotificationToggle('push')}
              className={`w-10 h-6 rounded-full relative transition-colors ${
                pushNotif ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                pushNotif ? 'right-1 bg-white' : 'left-1 bg-muted-foreground'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-foreground">Görünüm</CardTitle>
            </div>
            {saved === 'appearance' && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <Check className="w-3 h-3" /> Kaydedildi
              </span>
            )}
          </div>
          <CardDescription className="text-muted-foreground">Görünümü ve hissi özelleştirin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <button
              onClick={() => handleThemeChange('dark')}
              className={`w-20 h-20 rounded-lg bg-gray-900 border-2 relative transition-all ${
                theme === 'dark' ? 'border-primary' : 'border-border opacity-50 hover:opacity-100'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white">Koyu</div>
              {theme === 'dark' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => handleThemeChange('light')}
              className={`w-20 h-20 rounded-lg bg-gray-100 border-2 relative transition-all ${
                theme === 'light' ? 'border-primary' : 'border-border opacity-50 hover:opacity-100'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-900">Açık</div>
              {theme === 'light' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <CardTitle className="text-foreground">Kullanıcı Yönetimi</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">Ekip üyelerini ve izinleri yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings/users">
            <Button variant="outline" className="gap-2 w-full justify-between">
              <span>Kullanıcıları Yönet</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
