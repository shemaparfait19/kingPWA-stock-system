'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Printer } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { InvoiceDialog } from '../components/invoice-dialog';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = sales.filter(
        (sale) =>
          sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (sale.customer && sale.customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredSales(filtered);
    } else {
      setFilteredSales(sales);
    }
  }, [searchQuery, sales]);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      if (response.ok) {
        const data = await response.json();
        setSales(data);
        setFilteredSales(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setLoading(false);
    }
  };

  const handleViewInvoice = (sale: any) => {
    setSelectedInvoice(sale);
    setShowInvoice(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sales History</h2>
        <p className="text-muted-foreground">View and manage all sales transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search by invoice number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sales Table */}
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading sales...</p>
          ) : filteredSales.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No sales found</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Invoice #</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Customer</th>
                    <th className="text-left p-3">Payment Method</th>
                    <th className="text-right p-3">Total</th>
                    <th className="text-right p-3">Status</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{sale.invoiceNumber}</td>
                      <td className="p-3">{formatDateTime(sale.saleDate)}</td>
                      <td className="p-3">
                        {sale.customer ? sale.customer.name : 'Walk-in Customer'}
                      </td>
                      <td className="p-3 capitalize">
                        {sale.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            sale.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : sale.paymentStatus === 'partial'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewInvoice(sale)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={showInvoice}
        onOpenChange={setShowInvoice}
        invoice={selectedInvoice}
      />
    </div>
  );
}
