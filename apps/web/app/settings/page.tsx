
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white neon-text">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and system settings.</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card border-white/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle className="text-white">Profile Settings</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white">Display Name</label>
              <input 
                type="text" 
                defaultValue="Emre Demir"
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-md"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-white">Email</label>
              <input 
                type="email" 
                defaultValue="emre.demir@tradesphere.com"
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-white">Notifications</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">Configure how you receive alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm text-white">Email Notifications</span>
              <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 pt-4">
              <span className="text-sm text-white">Push Notifications</span>
              <div className="w-10 h-6 bg-white/10 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white/50 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-white">Appearance</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">Customize the look and feel.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-black border-2 border-primary relative cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white">Dark</div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div className="w-20 h-20 rounded-lg bg-white border border-white/10 relative cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 flex items-center justify-center text-xs text-black">Light</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
