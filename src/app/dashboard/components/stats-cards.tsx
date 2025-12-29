'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, DollarSign, Wrench } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function StatsCards() {
  const [stats, setStats] = useState({
    todaySales: 0,
    repairRevenue: 0,
    netProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        setStats({
          todaySales: data.todaySales,
          repairRevenue: data.repairRevenue,
          netProfit: data.netProfit,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statsData = [
    {
      title: "Today's Sales",
      value: stats.todaySales,
      icon: DollarSign,
      description: 'Total revenue from sales',
    },
    {
      title: 'Repair Revenue',
      value: stats.repairRevenue,
      icon: Wrench,
      description: 'Total revenue from repairs',
    },
    {
      title: 'Net Profit',
      value: stats.netProfit,
      icon: Activity,
      description: 'Total profit after costs',
    },
  ];

  return (
    <>
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(stat.value)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
