'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface MonthlySummaryProps {
  data: any;
}

export function MonthlySummary({ data }: MonthlySummaryProps) {
  if (!data || !data.daily) return <div>No data available</div>;

  // Identify all unique technicians across the period to build dynamic columns
  const allTechNames = new Set<string>();
  data.daily.forEach((day: any) => {
    Object.values(day.technicians).forEach((tech: any) => {
       allTechNames.add(tech.name);
    });
  });
  const techs = Array.from(allTechNames).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Report (RAPOLO)</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
           <thead>
             <tr className="bg-muted border-b">
               <th className="p-2 text-left border-r min-w-[100px] sticky left-0 bg-muted">Date</th>
               {/* Technician Columns */}
               {techs.map(tech => (
                 <th key={tech} className="p-2 text-center border-r min-w-[150px]" colSpan={2}>
                    {tech}
                    <div className="grid grid-cols-2 text-xs font-normal mt-1 border-t pt-1">
                        <span>Income</span>
                        <span className="text-red-500">Loss/Cost</span>
                    </div>
                 </th>
               ))}
               <th className="p-2 text-right border-r min-w-[100px]">Expenses</th>
               <th className="p-2 text-right border-r min-w-[100px]">Total Income</th>
               <th className="p-2 text-right min-w-[100px]">Balance</th>
             </tr>
           </thead>
           <tbody>
             {data.daily.map((day: any) => {
                const dayBalance = day.income - day.loss; // Net for the day
                return (
                  <tr key={day.date} className="border-b hover:bg-muted/20">
                    <td className="p-2 border-r font-medium sticky left-0 bg-background">
                        {format(parseISO(day.date), 'dd-MMM')}
                    </td>
                    
                    {/* Tech Data Cells */}
                    {techs.map(techName => {
                        // Find this tech's data for the day
                        const techData = Object.values(day.technicians).find((t: any) => t.name === techName) as any;
                        return (
                            <>
                                <td className="p-2 text-right border-r-0 text-green-700">
                                    {techData?.income > 0 ? formatCurrency(techData.income).replace('RWF', '') : '-'}
                                </td>
                                <td className="p-2 text-right border-r text-red-500 bg-red-50/50">
                                    {techData?.loss > 0 ? formatCurrency(techData.loss).replace('RWF', '') : '-'}
                                </td>
                            </>
                        );
                    })}

                    <td className="p-2 text-right border-r text-red-600">
                        {day.expenses > 0 ? formatCurrency(day.expenses).replace('RWF', '') : '-'}
                    </td>
                    <td className="p-2 text-right border-r font-bold">
                        {day.income > 0 ? formatCurrency(day.income).replace('RWF', '') : '-'}
                    </td>
                    <td className={`p-2 text-right font-bold ${dayBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(dayBalance).replace('RWF', '')}
                    </td>
                  </tr>
                );
             })}

             {/* Totals Row */}
             <tr className="bg-muted font-bold border-t-2 border-black">
                <td className="p-2 border-r sticky left-0 bg-muted">TOTAL</td>
                {techs.map(techName => {
                    const techSummary = data.summary.byTechnician[techName];
                    return (
                        <>
                            <td className="p-2 text-right text-green-800">
                                {techSummary ? formatCurrency(techSummary.income).replace('RWF', '') : '0'}
                            </td>
                            <td className="p-2 text-right border-r text-red-800">
                                {techSummary ? formatCurrency(techSummary.loss).replace('RWF', '') : '0'}
                            </td>
                        </>
                    );
                })}
                <td className="p-2 text-right border-r text-red-800">
                    {formatCurrency(data.summary.totalExpenses).replace('RWF', '')}
                </td>
                <td className="p-2 text-right border-r">
                    {formatCurrency(data.summary.totalIncome).replace('RWF', '')}
                </td>
                <td className={`p-2 text-right ${data.summary.netProfit >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                    {formatCurrency(data.summary.netProfit).replace('RWF', '')}
                </td>
             </tr>
           </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
