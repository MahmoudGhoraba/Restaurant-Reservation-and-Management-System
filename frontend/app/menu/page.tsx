'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MenuItem, OrderItem, CreateOrderDto, Reservation } from '@/types';

interface CartItem extends OrderItem {
  menuItem: MenuItem;
  menuItemId: string;
  specialInstructions?: string;
}

export default function MenuPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderType, setOrderType] = useState<'Takeaway' | 'DineIn' | 'Delivery'>('Takeaway');
  const [paymentType, setPaymentType] = useState<'Cash' | 'Card' | 'Online'>('Card');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<string>('');

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await apiClient.get<{ status: string; results: number; data: MenuItem[] }>('/customers/menu');
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          const items = response.data.data || [];
          setMenuItems(items);
        }
      } catch (err) {
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // fetch user's reservations when DineIn is selected
  useEffect(() => {
    const fetchReservations = async () => {
      if (!auth.isAuthenticated()) return;
      try {
        const res = await apiClient.get<{ status: string; results: number; data: Reservation[] }>('/reservations/my-reservations');
        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setReservations(res.data.data || []);
        }
      } catch {
        setError('Failed to load reservations');
      }
    };

    if (orderType === 'DineIn') fetchReservations();
  }, [orderType]);

  const addToCart = (item: MenuItem) => {
    if (!(item.availability ?? item.available ?? true)) return;
    if (!item._id) return;

    const existingItem = cart.find((cartItem) => cartItem.menuItemId === item._id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.menuItemId === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item._id,
          quantity: 1,
          menuItem: item,
          specialInstructions: '',
        },
      ]);
    }
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((item) => item.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const updateItemInstructions = (menuItemId: string, instructions: string) => {
    setCart(
      cart.map((item) =>
        item.menuItemId === menuItemId ? { ...item, specialInstructions: instructions } : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  const handlePlaceOrder = async () => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (orderType === 'DineIn' && !selectedReservationId) {
      setError('Please select a reservation for Dine In orders');
      return;
    }

    setIsPlacingOrder(true);
    setError('');

    try {
      const orderDto: CreateOrderDto & { reservationId?: string; orderType: string; paymentType: string; deliveryAddress?: string } = {
        items: cart.map((item) => ({
          menuItem: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || undefined,
        })),
        orderType,
        paymentType,
        deliveryAddress: orderType === 'Delivery' ? deliveryAddress : undefined,
        // include reservationId only for DineIn
        ...(orderType === 'DineIn' ? { reservationId: selectedReservationId } : {}),
      };

      const response = await apiClient.post<{ status: string; message: string; data: any }>('/customers/order', orderDto);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setCart([]);
        setDeliveryAddress('');
        setShowCart(false);
        setSelectedReservationId('');
        router.push('/my-orders');
      }
    } catch (err) {
      setError('Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Our Menu</h1>
        {cart.length > 0 && (
          <Button
            variant="primary"
            onClick={() => setShowCart(!showCart)}
          >
            Cart ({cart.length})
            {cart.length > 0 && (
              <span style={{ marginLeft: '0.5rem', background: '#FFFFFF', color: '#000000', borderRadius: '9999px', padding: '0.25rem 0.5rem', fontSize: '0.875rem', fontWeight: '700' }}>
                ${getTotal().toFixed(2)}
              </span>
            )}
          </Button>
        )}
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && cart.length > 0 && (
        <div className="overlay">
          <div className="modal">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between items-start border-b pb-4">
                    <div style={{ flex: 1 }}>
                      <h3 className="font-semibold">{item.menuItem.name}</h3>
                      <p className="text-sm">${item.menuItem.price.toFixed(2)} each</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          className="btn btn-outline btn-sm"
                          style={{ width: '1.5rem', height: '1.5rem', padding: 0 }}
                        >
                          -
                        </button>
                        <span style={{ width: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          className="btn btn-outline btn-sm"
                          style={{ width: '1.5rem', height: '1.5rem', padding: 0 }}
                        >
                          +
                        </button>
                      </div>

                      <div className="mt-3">
                        <Input
                          label="Item notes (optional)"
                          type="text"
                          value={item.specialInstructions || ''}
                          onChange={(e) => updateItemInstructions(item.menuItemId, e.target.value)}
                          placeholder="Any notes for this item..."
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="text-sm mt-2"
                        style={{ color: '#000000', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="form-label">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'Takeaway' | 'DineIn' | 'Delivery')}
                  className="form-select mb-4"
                >
                  <option value="DineIn">Dine In</option>
                  <option value="Takeaway">Takeaway</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>

              {orderType === 'DineIn' && (
                <div className="mb-4">
                  <label className="form-label">Select Reservation</label>
                  <select
                    value={selectedReservationId}
                    onChange={(e) => setSelectedReservationId(e.target.value)}
                    className="form-select mb-4"
                  >
                    <option value="">-- Select a reservation --</option>
                    {reservations.map((r) => (
                      <option key={r._id} value={r._id}>
                        {new Date(r.reservationDate).toLocaleDateString()} {r.reservationTime} — Guests {r.numberOfGuests}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {orderType === 'Delivery' && (
                <div className="mb-4">
                  <Input
                    label="Delivery Address"
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="form-label">Payment Type</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as 'Cash' | 'Card' | 'Online')}
                  className="form-select mb-4"
                >
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="btn-full"
                onClick={handlePlaceOrder}
                isLoading={isPlacingOrder}
                disabled={(orderType === 'Delivery' && !deliveryAddress) || (orderType === 'DineIn' && !selectedReservationId)}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {menuItems.length === 0 ? (
        <div className="text-center py-12">
          <p>No menu items available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-3 gap-6">
          {menuItems.map((item) => (
            <div key={item._id} className="card">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="img-responsive img-cover"
                  style={{ width: '100%', height: '12rem', objectFit: 'cover' }}
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                </div>
                <p className="mb-4">{item.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm">Category: {item.category}</span>
                  <span
                    className={`badge ${(item.availability ?? item.available ?? true) ? 'badge-success' : 'badge-error'}`}
                  >
                    {(item.availability ?? item.available ?? true) ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                {(item.availability ?? item.available ?? true) && (
                  <Button variant="primary" size="sm" className="btn-full" onClick={() => addToCart(item)}>
                    {auth.isAuthenticated() ? 'Add to Cart' : 'Login to Order'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}