'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { MonthlySummary } from './components/monthly-summary';
import { DailyReportTable } from './components/daily-report-table';
import { Loader2, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // Date Range State (Default to current month)
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

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
         <div className="flex items-end gap-2 bg-card p-2 rounded-lg border shadow-sm">
            <div>
                <Label className="text-xs">Start Date</Label>
                <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 w-[140px]" 
                />
            </div>
            <div>
                <Label className="text-xs">End Date</Label>
                <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 w-[140px]" 
                />
            </div>
            <Button size="sm" onClick={fetchReports} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
                Run Report
            </Button>
         </div>
       </div>

       {/* Summary Cards */}
       {data?.summary && (
         <div className="grid gap-4 md:grid-cols-4">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Income</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.totalIncome)}</div>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Parts & Costs (Loss)</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold text-orange-600">{formatCurrency(data.summary.totalLoss - data.summary.totalExpenses)}</div>
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
       <Tabs defaultValue="monthly" className="w-full">
         <TabsList>
           <TabsTrigger value="monthly">Monthly Summary (RAPOLO)</TabsTrigger>
           <TabsTrigger value="daily">Daily Details</TabsTrigger>
         </TabsList>
         
         <TabsContent value="monthly">
            {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading report data...</div>
            ) : (
                <MonthlySummary data={data} />
            )}
         </TabsContent>
         
         <TabsContent value="daily">
            {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading report data...</div>
            ) : (
                <DailyReportTable data={data} />
            )}
         </TabsContent>
       </Tabs>
     </div>
  );
}
