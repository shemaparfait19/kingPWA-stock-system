'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Printer, Download, X, Share2, Smartphone } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ... (props interface)

export function InvoiceDialog({ open, onOpenChange, invoice }: InvoiceDialogProps) {
    if (!invoice) return null;

    const generatePDF = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246); // Blue
        doc.text('KING SERVICE TECH', 105, 15, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Phone & Computer Repair Services', 105, 22, { align: 'center' });
        doc.text('Phone: +250 787 649 480', 105, 27, { align: 'center' });

        // Invoice Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`INVOICE #${invoice.invoiceNumber}`, 14, 40);
        doc.setFontSize(10);
        doc.text(`Date: ${formatDateTime(invoice.saleDate)}`, 14, 46);
        
        if (invoice.customer) {
            doc.text(`Customer: ${invoice.customer.name}`, 14, 52);
            if (invoice.customer.phone) doc.text(`Phone: ${invoice.customer.phone}`, 14, 57);
        }

        // Table
        const tableColumn = ["Item", "Qty", "Price", "Total"];
        const tableRows = invoice.items.map((item: any) => [
            item.item?.name || 'Item',
            item.quantity,
            formatCurrency(item.unitPrice),
            formatCurrency(item.total)
        ]);

        autoTable(doc, {
            startY: 65,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY || 65;
        doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, 140, finalY + 10);
        doc.text(`Tax: ${formatCurrency(invoice.tax)}`, 140, finalY + 15);
        doc.setFontSize(12);
        doc.text(`Total: ${formatCurrency(invoice.total)}`, 140, finalY + 22);
        doc.setFontSize(10);
        doc.text(`Paid: ${formatCurrency(invoice.paidAmount)}`, 140, finalY + 28);
        if (invoice.paidAmount < invoice.total) {
             doc.setTextColor(220, 38, 38); // Red
             doc.text(`Balance due: ${formatCurrency(invoice.total - invoice.paidAmount)}`, 140, finalY + 34);
        }

        return doc;
    };

    const handleDownload = () => {
        const doc = generatePDF();
        doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
    };

    const handleShare = async () => {
        const doc = generatePDF();
        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], `Invoice_${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: `Invoice ${invoice.invoiceNumber}`,
                    text: `Hello, here is your invoice from King Service Tech.`
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback for desktop: Download and open WhatsApp Web
            handleDownload();
            const phone = invoice.customer?.phone ? invoice.customer.phone.replace(/\D/g, '') : '';
            const waLink = `https://wa.me/${phone}?text=Hello, please find your invoice attached (downloaded).`;
            window.open(waLink, '_blank');
        }
    };

    const handlePrint = () => {
         window.print();
    };
    
    // ... helper for getInvoiceHTML (keep existing if needed for print, or replace with PDF print logic) ...
    // Assuming we keep getInvoiceHTML for window.print() CSS styles as backup or clean-up.
    // For brevity, I'll rely on the existing HTML/CSS print or just the PDF download. 
    // The user specifically asked for "send as PDF", so the share button is key.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice #{invoice.invoiceNumber}</span>
            <div className="flex gap-2 print:hidden">
              <Button onClick={handleShare} size="sm" className="bg-green-600 hover:bg-green-700">
                <Smartphone className="h-4 w-4 mr-2" />
                WhatsApp / Share
              </Button>
              <Button onClick={() => window.print()} size="sm" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              {/* <Button onClick={handleDownload} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button> */}
              <Button onClick={() => onOpenChange(false)} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        {/* ... rest of content */}

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
