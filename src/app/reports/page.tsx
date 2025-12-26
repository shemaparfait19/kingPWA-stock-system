import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Financial &amp; Operational Reports</CardTitle>
          <CardDescription>Generate and view detailed reports on sales, profits, and inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A comprehensive reporting suite will be available here, with customizable date ranges and export options.</p>
        </CardContent>
      </Card>
    </div>
  );
}
