'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Users, Bell, Lock, Palette, Database, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  const settingsCards = [
    {
      title: 'User Management',
      description: 'Manage staff accounts, roles, and permissions',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      path: '/settings/users',
    },
    {
      title: 'Notifications',
      description: 'Configure push notifications and alerts',
      icon: Bell,
      color: 'from-green-500 to-green-600',
      path: '/settings/notifications',
      comingSoon: true,
    },
    {
      title: 'Security',
      description: 'Password policies and security settings',
      icon: Lock,
      color: 'from-purple-500 to-purple-600',
      path: '/settings/security',
      comingSoon: true,
    },
    {
      title: 'Appearance',
      description: 'Customize theme and display preferences',
      icon: Palette,
      color: 'from-pink-500 to-pink-600',
      path: '/settings/appearance',
      comingSoon: true,
    },
    {
      title: 'Database',
      description: 'Backup, restore, and data management',
      icon: Database,
      color: 'from-orange-500 to-orange-600',
      path: '/settings/database',
      comingSoon: true,
    },
    {
      title: 'General',
      description: 'Business information and general settings',
      icon: SettingsIcon,
      color: 'from-gray-500 to-gray-600',
      path: '/settings/general',
      comingSoon: true,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCards.map((setting) => {
          const Icon = setting.icon;
          return (
            <Card
              key={setting.path}
              className="hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden group"
              onClick={() => !setting.comingSoon && router.push(setting.path)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${setting.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${setting.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {setting.comingSoon && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <CardTitle>{setting.title}</CardTitle>
                <CardDescription>{setting.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="w-full"
                  disabled={setting.comingSoon}
                >
                  {setting.comingSoon ? 'Coming Soon' : 'Configure'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 list-disc list-inside">
            <li>Add technicians and staff in User Management</li>
            <li>Configure notification preferences for important alerts</li>
            <li>Regular database backups are recommended</li>
            <li>Update security settings to protect your data</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
