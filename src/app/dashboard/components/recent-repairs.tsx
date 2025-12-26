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

const repairs = [
  {
    id: 'REP-2024-001',
    customer: 'John Doe',
    device: 'iPhone 13',
    status: 'In Progress',
  },
  {
    id: 'REP-2024-002',
    customer: 'Jane Smith',
    device: 'Samsung Galaxy S21',
    status: 'Ready for Pickup',
  },
  {
    id: 'REP-2024-003',
    customer: 'Peter Jones',
    device: 'Dell XPS 15',
    status: 'Pending Diagnosis',
  },
  {
    id: 'REP-2024-004',
    customer: 'Mary Johnson',
    device: 'MacBook Pro 16"',
    status: 'Completed',
  },
    {
    id: 'REP-2024-005',
    customer: 'Chris Lee',
    device: 'Playstation 5',
    status: 'In Progress',
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'In Progress':
      return 'secondary';
    case 'Ready for Pickup':
      return 'default';
    case 'Pending Diagnosis':
      return 'destructive';
    case 'Completed':
      return 'outline';
    default:
      return 'outline';
  }
};

export function RecentRepairs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Repairs</CardTitle>
        <CardDescription>A list of the most recent repair jobs.</CardDescription>
      </CardHeader>
      <CardContent>
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
              <TableRow key={repair.id}>
                <TableCell className="font-medium">{repair.id}</TableCell>
                <TableCell>{repair.customer}</TableCell>
                <TableCell>{repair.device}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(repair.status)}>
                    {repair.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
