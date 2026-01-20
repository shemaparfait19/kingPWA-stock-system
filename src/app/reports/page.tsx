'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { MonthlySummary } from './components/monthly-summary';
import { DailyReportTable } from './components/daily-report-table';
import { Loader2, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // Date Range State (Default to current month)
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateRange, setDateRange] = useState('month');

  const handleRangeChange = (value: string) => {
    setDateRange(value);
    const now = new Date();
    let start = now;
    let end = now;

    switch (value) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'custom':
        return; // Don't change dates, let user pick
    }
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ startDate, endDate }).toString();
      const res = await fetch(`/api/reports/financials?${query}`);
      const reportData = await res.json();
      if (res.ok) {
        setData(reportData);
      } else {
        console.error('Failed to fetch reports:', reportData.error);
      }
    } catch (e) {
      console.error('Error fetching reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []); // Initial load

  return (
     <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
         
         {/* Date Filter */}
         <div className="flex flex-wrap items-end gap-2 bg-card p-2 rounded-lg border shadow-sm">
            <div className="w-[140px]">
                <Label className="text-xs mb-1 block">Period</Label>
                <Select value={dateRange} onValueChange={handleRangeChange}>
                    <SelectTrigger className="h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="text-xs">Start Date</Label>
                <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => { setStartDate(e.target.value); setDateRange('custom'); }}
                    className="h-8 w-[130px]" 
                />
            </div>
            <div>
                <Label className="text-xs">End Date</Label>
                <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => { setEndDate(e.target.value); setDateRange('custom'); }}
                    className="h-8 w-[130px]" 
                />
            </div>
            <Button size="sm" onClick={fetchReports} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
                Run
            </Button>
         </div>
       </div>

       {/* Summary Cards */}
       {data?.summary && (
         <div className="grid gap-4 md:grid-cols-4">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.totalRevenue)}</div>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Parts Cost (COGS)</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold text-orange-600">{formatCurrency(data.summary.totalPartsCost)}</div>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Expenses</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold text-red-600">{formatCurrency(data.summary.totalExpenses)}</div>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
             </CardHeader>
             <CardContent>
               <div className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                 {formatCurrency(data.summary.netProfit)}
               </div>
             </CardContent>
           </Card>
         </div>
       )}

       {/* Tabs */}
       <Tabs defaultValue="overview" className="w-full">
         <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
           <TabsTrigger value="overview" className="py-2">Overview (RAPOLO)</TabsTrigger>
           <TabsTrigger value="daily" className="py-2">Daily Ledger</TabsTrigger>
           <TabsTrigger value="repairs" className="py-2">Repairs</TabsTrigger>
           <TabsTrigger value="sales" className="py-2">Sales</TabsTrigger>
           <TabsTrigger value="expenses" className="py-2">Expenses</TabsTrigger>
         </TabsList>
         
         <TabsContent value="overview">
            {loading ? <div className="p-8 text-center">Loading...</div> : <MonthlySummary data={data} />}
         </TabsContent>
         
         <TabsContent value="daily">
            {loading ? <div className="p-8 text-center">Loading...</div> : <DailyReportTable data={data} />}
         </TabsContent>
         
         <TabsContent value="repairs">
            {/* Simple Repairs List View reused or custom table */}
            {loading ? <div className="p-8 text-center">Loading...</div> : (
                <Card>
                    <CardHeader><CardTitle>Repairs Report</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                            Showing {data?.details?.repairs?.length || 0} repair jobs for this period.
                        </div>
                        {/* We could create a dedicated component, but for now reuse DailyTable logic or simple mapping */}
                        <div className="border rounded-md">
                         <table className="w-full text-sm">
                             <thead className="bg-muted text-left"><tr className="border-b"><th className="p-2">Job #</th><th className="p-2">Date</th><th className="p-2">Device</th><th className="p-2">Tech</th><th className="p-2 text-right">Cost</th></tr></thead>
                             <tbody>
                                {data?.details?.repairs?.map((r: any) => (
                                    <tr key={r.id} className="border-b">
                                        <td className="p-2 font-medium">{r.jobNumber}</td>
                                        <td className="p-2">{formatDateTime(r.createdAt)}</td>
                                        <td className="p-2">{r.deviceType} {r.brand}</td>
                                        <td className="p-2">{r.assignedUser?.fullName}</td>
                                        <td className="p-2 text-right">{formatCurrency(r.actualCost)}</td>
                                    </tr>
                                ))}
                             </tbody>
                         </table>
                        </div>
                    </CardContent>
                </Card>
            )}
         </TabsContent>

          <TabsContent value="sales">
            {loading ? <div className="p-8 text-center">Loading...</div> : (
                <Card>
                    <CardHeader><CardTitle>Sales Report</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                            Showing {data?.details?.sales?.length || 0} sales for this period.
                        </div>
                        <div className="border rounded-md">
                         <table className="w-full text-sm">
                             <thead className="bg-muted text-left"><tr className="border-b"><th className="p-2">Inv #</th><th className="p-2">Date</th><th className="p-2">Items</th><th className="p-2">Seller</th><th className="p-2 text-right">Total</th></tr></thead>
                             <tbody>
                                {data?.details?.sales?.map((s: any) => (
                                    <tr key={s.id} className="border-b">
                                        <td className="p-2 font-medium">{s.invoiceNumber}</td>
                                        <td className="p-2">{formatDateTime(s.saleDate)}</td>
                                        <td className="p-2">{s.items?.length} items</td>
                                        <td className="p-2">{s.user?.fullName}</td>
                                        <td className="p-2 text-right">{formatCurrency(s.total)}</td>
                                    </tr>
                                ))}
                             </tbody>
                         </table>
                        </div>
                    </CardContent>
                </Card>
            )}
         </TabsContent>

         <TabsContent value="expenses">
            {loading ? <div className="p-8 text-center">Loading...</div> : (
                <Card>
                    <CardHeader><CardTitle>Expenses Report</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                            Showing {data?.details?.expenses?.length || 0} expenses for this period.
                        </div>
                        <div className="border rounded-md">
                         <table className="w-full text-sm">
                             <thead className="bg-muted text-left"><tr className="border-b"><th className="p-2">Date</th><th className="p-2">Category</th><th className="p-2">Description</th><th className="p-2 text-right">Amount</th></tr></thead>
                             <tbody>
                                {data?.details?.expenses?.map((e: any) => (
                                    <tr key={e.id} className="border-b">
                                        <td className="p-2">{formatDateTime(e.expenseDate)}</td>
                                        <td className="p-2"><Badge variant="outline">{e.category}</Badge></td>
                                        <td className="p-2">{e.description}</td>
                                        <td className="p-2 text-right">{formatCurrency(e.amount)}</td>
                                    </tr>
                                ))}
                             </tbody>
                         </table>
                        </div>
                    </CardContent>
                </Card>
            )}
         </TabsContent>

       </Tabs>
     </div>
  );
}
