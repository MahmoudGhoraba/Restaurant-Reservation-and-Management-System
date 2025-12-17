'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import type { Order, MenuItem } from '@/types';

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch menu items to display order details
        const menuRes = await apiClient.get<{ status: string; results: number; data: MenuItem[] }>('/customers/menu');
        if (menuRes.data) {
          const menuMap: Record<string, MenuItem> = {};
          (menuRes.data.data || []).forEach((item) => {
            if (item._id) {
              menuMap[item._id] = item;
            }
          });
          setMenuItems(menuMap);
        }

        // Fetch user's orders
        const ordersRes = await apiClient.get<{ status: string; results: number; data: Order[] }>('/customers/orders');
        if (ordersRes.data) {
          setOrders(ordersRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleTrackOrder = async (orderId: string) => {
    setError('');
    try {
      const response = await apiClient.get<{ status: string; data: Order }>(`/customers/order/${orderId}`);
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.data && response.data.data) {
        const order = response.data.data;
        setSelectedOrder(order._id || orderId);
        setError(''); // Clear any previous errors
        // Update or add order to the list
        setOrders((prev) => {
          const existing = prev.find((o) => o._id === order._id || o._id === orderId);
          if (existing) {
            return prev.map((o) => (o._id === order._id || o._id === orderId ? order : o));
          }
          return [...prev, order];
        });
      } else {
        setError('Order not found. Please check the Order ID.');
      }
    } catch (err) {
      setError('Failed to track order. Please check the Order ID and try again.');
    }
  };

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
        <h1 className="text-4xl font-bold">My Orders</h1>
        <Link href="/menu">
          <Button variant="primary">Place New Order</Button>
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {/* Track Order Section */}
      <div className="card mb-8">
        <h2 className="text-2xl font-semibold mb-4">Track an Order</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Order ID"
            className="form-input"
            style={{ flex: 1 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const orderId = (e.target as HTMLInputElement).value;
                if (orderId) {
                  handleTrackOrder(orderId);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <Button
            variant="primary"
            onClick={() => {
              const input = document.querySelector('input[placeholder="Enter Order ID"]') as HTMLInputElement;
              if (input?.value) {
                handleTrackOrder(input.value);
                input.value = '';
              }
            }}
          >
            Track
          </Button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="mb-4">No orders found.</p>
          <p className="text-sm mb-4">
            Track an order using the Order ID above, or place a new order from the menu.
          </p>
          <Link href="/menu">
            <Button variant="primary">Browse Menu</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`card ${selectedOrder === order._id ? 'border' : ''
                }`}
              style={selectedOrder === order._id ? { borderWidth: '2px', borderColor: '#000000' } : {}}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Order #{order._id?.slice(-8)}</h3>
                  <p className="text-sm mt-1">
                    Date: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'} at{' '}
                    {order.orderDate ? new Date(order.orderDate).toLocaleTimeString() : 'N/A'}
                  </p>
                  {order.orderType && (
                    <p className="text-sm mt-1">
                      Type: {order.orderType} | Payment: {order.paymentType}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
                  </p>
                  <span
                    className={`badge mt-2 ${order.status === 'Completed'
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

              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-2">Order Items:</h4>
                <ul className="space-y-2">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => {
                      // Handle populated menuItem (object) or menuItemId (string)
                      let itemName = '';
                      let itemPrice = 0;
                      let itemId = '';

                      if (typeof item.menuItem === 'object' && item.menuItem !== null) {
                        // Populated menuItem object
                        itemName = (item.menuItem as any).name || item.name || 'Unknown Item';
                        itemPrice = (item.menuItem as any).price || item.price || 0;
                        itemId = (item.menuItem as any)._id || '';
                      } else if (item.menuItemId) {
                        // menuItemId string - look up in menuItems map
                        const menuItem = menuItems[item.menuItemId];
                        itemName = menuItem?.name || 'Unknown Item';
                        itemPrice = menuItem?.price || 0;
                        itemId = item.menuItemId;
                      } else if (typeof item.menuItem === 'string') {
                        // menuItem is ObjectId string
                        const menuItem = menuItems[item.menuItem];
                        itemName = menuItem?.name || 'Unknown Item';
                        itemPrice = menuItem?.price || 0;
                        itemId = item.menuItem;
                      } else {
                        itemName = item.name || 'Unknown Item';
                        itemPrice = item.price || 0;
                        itemId = `item-${index}`;
                      }

                      const displayPrice = item.subTotal || (itemPrice * item.quantity);

                      return (
                        <li key={index} className="flex justify-between">
                          <span>
                            {itemName} x {item.quantity}
                            {item.specialInstructions && (
                              <span className="text-sm ml-2" style={{ opacity: 0.7 }}>
                                ({item.specialInstructions})
                              </span>
                            )}
                          </span>
                          <span className="font-medium">
                            ${displayPrice.toFixed(2)}
                          </span>
                        </li>
                      );
                    })
                  ) : (
                    <li>No items found</li>
                  )}
                </ul>
              </div>

              {order.paymentStatus && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm">
                    Payment Status:{' '}
                    <span
                      className={`font-medium ${order.paymentStatus === 'paid'
                          ? 'text-primary'
                          : order.paymentStatus === 'refunded'
                            ? 'text-primary'
                            : 'text-primary'
                        }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
