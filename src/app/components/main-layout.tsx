// ... imports
import {
  hasPermission,
  canViewReports,
  canManageUsers
} from '@/lib/permissions';

// ... (navItems definition)

export const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [headerTitle, setHeaderTitle] = useState('King Service Tech');

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => {
    if (item.label === 'Reports') {
      return canViewReports(user?.role);
    }
    // Technicians usually don't need Sales/POS? Or maybe they do for parts?
    // Letting them see it for now, can restrict later if needed.
    return true; 
  });

  // ... (rest of the component)

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
              {visibleNavItems.map((item) => (
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
             {/* Only show Settings if user has management permissions */}
              {hasPermission(user?.role, 'manage_settings') && (
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
              )}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          {/* ... */}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
