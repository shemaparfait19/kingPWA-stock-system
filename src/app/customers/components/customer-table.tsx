'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/app/components/auth-provider';
import { canDeleteCustomers } from '@/lib/permissions';

export function CustomerTable({ customers, loading, onUpdate }: CustomerTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const canDelete = canDeleteCustomers(user?.role);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading customers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mb-4 opacity-50" />
            <p>No customers found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Loyalty Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => router.push(`/customers/${customer.id}`)}
                  >
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>
                      <Badge className={customerTypeColors[customer.customerType as keyof typeof customerTypeColors]}>
                        {customerTypeLabels[customer.customerType as keyof typeof customerTypeLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                    <TableCell>{customer.loyaltyPoints}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/customers/${customer.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if(confirm('Are you sure you want to delete this customer?')) {
                                try {
                                    const res = await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' });
                                    if(res.ok) {
                                        onUpdate();
                                    } else {
                                        const err = await res.json();
                                        alert(err.error || 'Failed to delete');
                                    }
                                } catch(err: any) {
                                    alert('Error deleting');
                                }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
