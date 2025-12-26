import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function CustomersPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>Manage customer profiles, view repair history, and track payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Customer relationship management tools will be available here, including customer lists, search functionality, and communication logs.</p>
        </CardContent>
      </Card>
    </div>
  );
}
