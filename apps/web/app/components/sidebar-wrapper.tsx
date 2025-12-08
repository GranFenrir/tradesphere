"use client";

import { Sidebar, type SidebarUser } from "@repo/ui/sidebar";
import { logout } from "../(auth)/actions";

interface SidebarWrapperProps {
  user?: SidebarUser | null;
  basePath?: string;
}

export function SidebarWrapper({ user, basePath = "" }: SidebarWrapperProps) {
  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar 
      basePath={basePath} 
      user={user} 
      onLogout={handleLogout} 
    />
  );
}