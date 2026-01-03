'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Printer, Trash2 } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { InvoiceDialog } from '../components/invoice-dialog';
import { useAuth } from '@/app/components/auth-provider';
import { canDeleteSales } from '@/lib/permissions';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<any[]>([]);
  // ...
  const { user } = useAuth();
  const canDelete = canDeleteSales(user?.role);

  // ... existing code ...

  const handleDelete = async (saleId: string) => {
      if(!confirm('Are you sure you want to delete this sale? This action cannot be undone.')) return;
      try {
          const res = await fetch(`/api/sales/${saleId}`, { method: 'DELETE' });
          if(res.ok) {
              fetchSales();
          } else {
              const err = await res.json();
              alert(err.error || "Failed to delete");
          }
      } catch(e) {
          alert('Error deleting');
      }
  };

  // ... inside return ...

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewInvoice(sale)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Invoice
                        </Button>
                        {canDelete && (
                            <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(sale.id)}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        </div>
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
