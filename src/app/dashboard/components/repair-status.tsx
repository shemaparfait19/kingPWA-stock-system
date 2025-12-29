'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RepairStatus() {
  const [stats, setStats] = useState({
    pending: 0,
    activeRepairs: 0,
    readyForPickup: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        setStats({
          pending: data.pendingRepairs || 0,
          activeRepairs: data.activeRepairs || 0,
          readyForPickup: data.readyForPickup || 0,
        });
      } catch (error) {
        console.error('Error fetching repair stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statuses = [
    { label: 'Pending', count: stats.pending, color: 'bg-yellow-500' },
    { label: 'In Progress', count: stats.activeRepairs, color: 'bg-blue-500' },
    { label: 'Ready for Pickup', count: stats.readyForPickup, color: 'bg-green-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repair Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {statuses.map((status) => (
            <div
              key={status.label}
              className="p-4 bg-secondary rounded-lg flex flex-col items-center justify-center text-center"
            >
              <span
                className={`w-3 h-3 rounded-full mb-2 ${status.color}`}
              ></span>
              <p className="text-xs text-muted-foreground">{status.label}</p>
              <p className="text-2xl font-bold">{status.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
