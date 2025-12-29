'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Printer, Download, X } from 'lucide-react';

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
}

export function InvoiceDialog({ open, onOpenChange, invoice }: InvoiceDialogProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable version
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(getInvoiceHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .invoice-details { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f3f4f6; font-weight: 600; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { font-size: 18px; font-weight: bold; margin-top: 10px; }
          .footer { margin-top: 40px; text-align: center; color: #666; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">KING SERVICE TECH</div>
          <p>Phone & Computer Repair Services</p>
          <p>Phone: +250 787 649 480 | Website: kingservicetechltd.com/</p>
        </div>
        
        <div class="invoice-details">
          <h2>INVOICE #${invoice.invoiceNumber}</h2>
          <p><strong>Date:</strong> ${formatDateTime(invoice.saleDate)}</p>
          ${invoice.customer ? `<p><strong>Customer:</strong> ${invoice.customer.name}</p>` : ''}
          ${invoice.customer?.phone ? `<p><strong>Phone:</strong> ${invoice.customer.phone}</p>` : ''}
          <p><strong>Payment Method:</strong> ${invoice.paymentMethod.replace('_', ' ').toUpperCase()}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td>${item.item?.name || 'Item'}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td>${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <p>Subtotal: ${formatCurrency(invoice.subtotal)}</p>
          <p>Tax: ${formatCurrency(invoice.tax)}</p>
          <p class="total-row">TOTAL: ${formatCurrency(invoice.total)}</p>
          <p>Paid: ${formatCurrency(invoice.paidAmount)}</p>
          ${invoice.paidAmount < invoice.total ? `<p>Balance Due: ${formatCurrency(invoice.total - invoice.paidAmount)}</p>` : ''}
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice #{invoice.invoiceNumber}</span>
            <div className="flex gap-2 print:hidden">
              <Button onClick={handlePrint} size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => onOpenChange(false)} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Content */}
        <div className="space-y-6 print:p-8">
          <div className="text-center border-b pb-4">
            <h1 className="text-3xl font-bold text-blue-600">KING SERVICE TECH</h1>
            <p className="text-gray-600">Phone & Computer Repair Services</p>
            <p className="text-sm text-gray-500">Phone: +250 787 649 480 | Website: kingservicetechltd.com/</p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Invoice Details</h3>
              <p><span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}</p>
              <p><span className="font-medium">Date:</span> {formatDateTime(invoice.saleDate)}</p>
              <p><span className="font-medium">Payment Method:</span> {invoice.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            </div>
            {invoice.customer && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Customer Details</h3>
                <p><span className="font-medium">Name:</span> {invoice.customer.name}</p>
                {invoice.customer.phone && <p><span className="font-medium">Phone:</span> {invoice.customer.phone}</p>}
                {invoice.customer.email && <p><span className="font-medium">Email:</span> {invoice.customer.email}</p>}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Item</th>
                  <th className="text-center p-3">Quantity</th>
                  <th className="text-right p-3">Unit Price</th>
                  <th className="text-right p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{item.item?.name || 'Item'}</td>
                    <td className="text-center p-3">{item.quantity}</td>
                    <td className="text-right p-3">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right p-3 font-medium">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Paid:</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              {invoice.paidAmount < invoice.total && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(invoice.total - invoice.paidAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t pt-4 text-gray-600 text-sm">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
