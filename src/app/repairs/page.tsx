import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RepairsPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Repair Job Management</CardTitle>
          <CardDescription>Manage all repair jobs from intake to completion.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Repair job content will be displayed here. This includes a Kanban board view and tools for managing the entire repair workflow.</p>
        </CardContent>
      </Card>
    </div>
  );
}
