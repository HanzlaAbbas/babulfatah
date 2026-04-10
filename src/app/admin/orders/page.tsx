import { OrdersTable } from '@/components/admin/orders-table';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders, view details, and update shipping status.</p>
      </div>
      <OrdersTable />
    </div>
  );
}
