import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function InventoryPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>Track shop stock and repair parts in real-time.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Inventory management features will be displayed here, including stock levels, reorder alerts, and supplier information.</p>
        </CardContent>
      </Card>
    </div>
  );
}
