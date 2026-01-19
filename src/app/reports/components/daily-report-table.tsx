'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyReportTableProps {
  data: any;
}

export function DailyReportTable({ data }: DailyReportTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Detailed daily breakdown view coming soon. Use the Monthly Summary tab for the aggregated "RAPOLO" view.</p>
        
        {/* Placeholder for future detailed list of every transaction */}
        <div className="mt-4 p-4 border rounded bg-muted/20">
            <h3 className="font-semibold mb-2">Debug Data Preview:</h3>
            <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(data.daily, null, 2)}
            </pre>
        </div>
      </CardContent>
    </Card>
  );
}
