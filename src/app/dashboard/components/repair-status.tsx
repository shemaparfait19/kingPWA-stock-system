import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RepairStatus() {
  const statuses = [
    { label: 'Pending', count: 5, color: 'bg-yellow-500' },
    { label: 'In Progress', count: 8, color: 'bg-blue-500' },
    { label: 'Ready for Pickup', count: 2, color: 'bg-green-500' },
    { label: 'Collected', count: 15, color: 'bg-gray-400' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repair Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statuses.map((status) => (
            <div
              key={status.label}
              className="p-4 bg-secondary rounded-lg flex flex-col items-center justify-center text-center"
            >
              <span
                className={`w-3 h-3 rounded-full mb-2 ${status.color}`}
              ></span>
              <p className="text-xs text-muted-foreground">{status.label}</p>
              <p className="text-2xl font-bold">{status.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
