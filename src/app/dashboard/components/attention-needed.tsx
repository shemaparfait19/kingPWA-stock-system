import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, CreditCard, Package } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return `RWF ${new Intl.NumberFormat('en-US').format(amount)}`;
};

export function AttentionNeeded() {
  const alerts = [
    {
      text: '3 items low on stock',
      icon: Package,
      className: 'text-yellow-600',
    },
    {
      text: '2 repairs overdue',
      icon: Clock,
      className: 'text-red-600',
    },
    {
      text: `${formatCurrency(90000)} in unpaid invoices`,
      icon: CreditCard,
      className: 'text-blue-600',
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Attention Needed</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {alerts.map((alert, index) => (
            <li key={index} className="flex items-center">
              <alert.icon
                className={`h-5 w-5 mr-3 ${alert.className}`}
              />
              <span className="font-medium">{alert.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
