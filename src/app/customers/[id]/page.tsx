'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, CreditCard, History } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/app/components/auth-provider';
import { canDeleteCustomers } from '@/lib/permissions';
import { CustomerDialog } from '../components/customer-dialog';
import { useToast } from '@/hooks/use-toast';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const canDelete = canDeleteCustomers(user?.role);
  
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchCustomer();
      fetchCustomerHistory();
    }
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      } else {
        toast({ title: 'Customer not found', variant: 'destructive' });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer:', error);
      setLoading(false);
    }
  };

  const fetchCustomerHistory = async () => {
    // Ideally we'd have an API endpoint for this, e.g. /api/customers/[id]/sales
    // For now we might skip or implement later.
  };

  const handleDelete = async () => {
      if(!confirm('Are you sure you want to delete this customer? All sales and history will be affected.')) return;
      
      try {
          const res = await fetch(`/api/customers/${params.id}`, { method: 'DELETE' });
          if(res.ok) {
              toast({ title: 'Customer deleted' });
              router.push('/customers');
          } else {
              const err = await res.json();
              toast({ title: 'Failed to delete', description: err.error, variant: 'destructive' });
          }
      } catch(e) {
          toast({ title: 'Error deleting customer', variant: 'destructive' });
      }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center">Customer not found</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
                <span>{customer.customerType}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
            </Button>
            {canDelete && (
                <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Customer
                </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
              <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                          <p className="font-medium">{customer.phone}</p>
                          {customer.phone2 && <p className="text-sm text-muted-foreground">{customer.phone2}</p>}
                      </div>
                  </div>
                  {customer.email && (
                      <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p>{customer.email}</p>
                      </div>
                  )}
                  {customer.address && (
                      <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <p>{customer.address}</p>
                      </div>
                  )}
              </CardContent>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>Total Spent</span>
                      </div>
                      <span className="font-bold text-lg">{formatCurrency(customer.totalSpent)}</span>
                  </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span>Loyalty Points</span>
                      </div>
                      <span className="font-bold text-lg">{customer.loyaltyPoints}</span>
                  </div>
              </CardContent>
          </Card>
          
          {customer.notes && (
            <Card className="md:col-span-3">
                <CardHeader>
                    <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{customer.notes}</p>
                </CardContent>
            </Card>
          )}
      </div>

      <CustomerDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog}
        customer={customer}
        onSuccess={() => {
            fetchCustomer();
            setShowEditDialog(false);
        }}
      />
    </div>
  );
}
