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
import { NotificationsDropdown } from './notifications-dropdown';
import { LanguageSwitcher } from './language-switcher';
import {
  hasPermission,
  canViewReports,
  canManageUsers
} from '@/lib/permissions';
import { useTranslations } from 'next-intl';
import { MobileNav } from './mobile-nav';

const navItems = [
  { href: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { href: '/repairs', label: 'repairs', icon: Wrench },
  { href: '/inventory', label: 'inventory', icon: Boxes },
  { href: '/customers', label: 'customers', icon: Users },
  { href: '/sales', label: 'sales', icon: ShoppingCart },
  { href: '/appointments', label: 'appointments', icon: Calendar },
  { href: '/reports', label: 'reports', icon: BarChart3 },
];

export const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [headerTitle, setHeaderTitle] = useState('King Service Tech');

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => {
    if (item.label === 'reports') {
      return canViewReports(user?.role);
    }
    return true; 
  });

  useEffect(() => {
    // Determine title based on current path
    const currentNavItem = navItems.find((item) => pathname.startsWith(item.href));
    // Translate the title if it matches a nav item, otherwise default string
    if (currentNavItem) {
        setHeaderTitle(t(currentNavItem.label as any));
    } else if (pathname.startsWith('/settings')) {
        setHeaderTitle(t('settings'));
    } else {
        setHeaderTitle('King Service Tech');
    }
  }, [pathname, t]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="bg-background hidden md:flex border-r">
          {/* ... existing Sidebar content ... */}
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
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      tooltip={t(item.label as any)}
                    >
                      <item.icon />
                      <span>{t(item.label as any)}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              {/* Language Switcher */}
              <SidebarMenuItem>
                <div className="px-2 py-1.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
                  <LanguageSwitcher />
                </div>
              </SidebarMenuItem>

              {/* Only show Settings if user has management permissions */}
              {hasPermission(user?.role, 'manage_settings') && (
                <SidebarMenuItem>
                  <Link href="/settings">
                    <SidebarMenuButton
                      isActive={pathname.startsWith('/settings')}
                      tooltip={t('settings')}
                    >
                      <Settings />
                      <span>{t('settings')}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex w-full flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
            {/* Hide SidebarTrigger on mobile since we have bottom nav */}
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            
            <div className="flex-1 overflow-hidden">
              <h1 className="text-lg font-semibold truncate">
                {headerTitle}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              <UserNav />
            </div>
          </header>
          
          {/* Add padding-bottom for mobile to account for fixed nav */}
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
          
          <MobileNav />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
