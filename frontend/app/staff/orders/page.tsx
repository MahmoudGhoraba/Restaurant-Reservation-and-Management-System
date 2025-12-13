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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Manage Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Served">Served</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                selectedOrder === order._id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Order #{order._id?.slice(-8)}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Date: {new Date(order.orderDate).toLocaleDateString()} at{' '}
                    {new Date(order.orderDate).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">${order.totalAmount.toFixed(2)}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'Served'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'Preparing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'Pending'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-100 text-gray-800'
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
                      <li key={index} className="flex justify-between text-gray-700">
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
                <div className="flex gap-2 flex-wrap">
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
