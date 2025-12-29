'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'secondary';
    case 'ready':
      return 'default';
    case 'pending':
      return 'destructive';
    case 'collected':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'ready':
      return 'Ready';
    case 'pending':
      return 'Pending';
    case 'diagnosed':
      return 'Diagnosed';
    case 'collected':
      return 'Collected';
    default:
      return status;
  }
};

export function RecentRepairs() {
  const [repairs, setRepairs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await fetch('/api/repairs');
        const data = await response.json();
        // Get only the 5 most recent repairs
        setRepairs(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching repairs:', error);
      }
    };

    fetchRepairs();
    const interval = setInterval(fetchRepairs, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Repairs</CardTitle>
        <CardDescription>Most recent repair jobs</CardDescription>
      </CardHeader>
      <CardContent>
        {repairs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No repair jobs yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.map((repair) => (
                <TableRow 
                  key={repair.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => router.push(`/repairs/${repair.id}`)}
                >
                  <TableCell className="font-medium">{repair.jobNumber}</TableCell>
                  <TableCell>{repair.customer.name}</TableCell>
                  <TableCell>{repair.deviceType} - {repair.brand}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(repair.status)}>
                      {getStatusLabel(repair.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
