'use client';
import type { FC, ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Wrench,
  Boxes,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Crown,
  Calendar,
} from 'lucide-react';
import { UserNav } from './user-nav';
import { useAuth } from './auth-provider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/repairs', label: 'Repairs', icon: Wrench },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/sales', label: 'Sales (POS)', icon: ShoppingCart },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

export const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [headerTitle, setHeaderTitle] = useState('King Service Tech');

  useEffect(() => {
    const currentNavItem = navItems.find((item) => pathname.startsWith(item.href));
    setHeaderTitle(currentNavItem?.label || 'King Service Tech');
  }, [pathname]);

  // Don't show sidebar on login page
  if (pathname === '/login' || loading) {
    return <>{children}</>;
  }

  // If not logged in and not on login page, show nothing (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="bg-background">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Crown className="text-primary h-8 w-8" />
              <span className="font-bold text-lg text-primary group-data-[collapsible=icon]:hidden">
                KingServ
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/settings">
                  <SidebarMenuButton
                    isActive={pathname.startsWith('/settings')}
                    tooltip="Settings"
                  >
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 overflow-hidden">
              <h1 className="text-lg font-semibold truncate">
                {headerTitle}
              </h1>
            </div>
            <UserNav />
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
