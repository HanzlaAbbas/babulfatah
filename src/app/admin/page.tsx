import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package, FolderTree, ShoppingCart, Users } from 'lucide-react';

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, orderCount, userCount] =
    await Promise.all([
      db.product.count(),
      db.category.count(),
      db.order.count(),
      db.user.count(),
    ]);

  const stats = [
    {
      label: 'Products',
      value: productCount,
      icon: Package,
      color: 'text-golden',
    },
    {
      label: 'Categories',
      value: categoryCount,
      icon: FolderTree,
      color: 'text-brand',
    },
    {
      label: 'Orders',
      value: orderCount,
      icon: ShoppingCart,
      color: 'text-islamic-green',
    },
    {
      label: 'Users',
      value: userCount,
      icon: Users,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Bab-ul-Fatah admin panel
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Your dashboard is ready. Start by adding products and categories
            using the sidebar navigation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
