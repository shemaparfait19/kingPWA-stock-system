import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, DollarSign, Wrench } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return `RWF ${new Intl.NumberFormat('en-US').format(amount)}`;
};

export function StatsCards() {
  const stats = [
    {
      title: "Today's Sales",
      value: 180000,
      icon: DollarSign,
      description: 'Total revenue from sales',
    },
    {
      title: 'Repair Revenue',
      value: 120000,
      icon: Wrench,
      description: 'Total revenue from repairs',
    },
    {
      title: 'Net Profit',
      value: 75000,
      icon: Activity,
      description: 'Total profit after costs',
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stat.value)}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
