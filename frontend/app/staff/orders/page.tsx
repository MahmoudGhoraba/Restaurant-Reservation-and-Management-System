'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import type { Order, MenuItem } from '@/types';

export default function StaffOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = auth.getUser();
    if (user?.role?.toLowerCase() !== 'staff') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersRes, menuRes] = await Promise.all([
          apiClient.get<{ status: string; results: number; data: Order[] }>('/orders'),
          apiClient.get<{ status: string; results: number; data: MenuItem[] }>('/customers/menu'),
        ]);

        if (ordersRes.data) {
          setOrders(ordersRes.data.data || []);
        }

        if (menuRes.data) {
          const menuMap: Record<string, MenuItem> = {};
          (menuRes.data.data || []).forEach((item) => {
            if (item._id) {
              menuMap[item._id] = item;
            }
          });
          setMenuItems(menuMap);
        }
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await apiClient.put<{ status: string; data: Order }>(
        `/orders/${orderId}/status`,
        { status: newStatus }
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? response.data!.data : o))
        );
      }
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter((o) => o.status === statusFilter);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Manage Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select"
        >
          <option value="all">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Served">Served</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 card">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className={`card ${
                selectedOrder === order._id ? 'border' : ''
              }`}
              style={selectedOrder === order._id ? { borderWidth: '2px', borderColor: '#000000' } : {}}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Order #{order._id?.slice(-8)}</h3>
                  <p className="text-sm mt-1">
                    Date: {new Date(order.orderDate).toLocaleDateString()} at{' '}
                    {new Date(order.orderDate).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${order.totalAmount.toFixed(2)}</p>
                  <span
                    className={`badge mt-2 ${
                      order.status === 'Completed'
                        ? 'badge-success'
                        : order.status === 'Served'
                        ? 'badge-info'
                        : order.status === 'Preparing'
                        ? 'badge-warning'
                        : order.status === 'Pending'
                        ? 'badge-primary'
                        : 'badge-primary'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <h4 className="font-semibold mb-2">Order Items:</h4>
                <ul className="space-y-2">
                  {order.items.map((item, index) => {
                    const menuItem = item.menuItemId ? menuItems[item.menuItemId] : null;
                    const itemId = item.menuItemId || `item-${index}`;
                    return (
                      <li key={index} className="flex justify-between">
                        <span>
                          {menuItem?.name || `Item ${itemId.toString().slice(-6)}`} x {item.quantity}
                        </span>
                        {menuItem && (
                          <span className="font-medium">
                            ${(menuItem.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Update Status:</h4>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {['Pending', 'Preparing', 'Served', 'Completed'].map((status) => (
                    <Button
                      key={status}
                      variant={order.status === status ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleUpdateStatus(order._id!, status)}
                      disabled={order.status === status}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
