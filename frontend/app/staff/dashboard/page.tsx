'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export default function StaffDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalReservations: 0,
    todayReservations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = auth.getUser();
    const userRole = user?.role?.toLowerCase();
    if (userRole !== 'staff') {
      if (!userRole) {
        router.push('/login');
      } else {
        router.push('/');
      }
      return;
    }

    const fetchStats = async () => {
      try {
        const [ordersRes, reservationsRes] = await Promise.all([
          apiClient.get<{ status: string; results: number; data: any[] }>('/orders'),
          apiClient.get<{ status: string; results: number; data: any[] }>('/reservations'),
        ]);

        if (ordersRes.data) {
          const orders = ordersRes.data.data || [];
          setStats((prev) => ({
            ...prev,
            totalOrders: orders.length,
            pendingOrders: orders.filter((o: any) => 
              ['Pending', 'Preparing'].includes(o.status)
            ).length,
          }));
        }

        if (reservationsRes.data) {
          const reservations = reservationsRes.data.data || [];
          const today = new Date().toISOString().split('T')[0];
          setStats((prev) => ({
            ...prev,
            totalReservations: reservations.length,
            todayReservations: reservations.filter((r: any) => 
              new Date(r.reservationDate).toISOString().split('T')[0] === today
            ).length,
          }));
        }
      } catch (err) {
        console.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Staff Dashboard</h1>

      <div className="grid grid-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold">{stats.pendingOrders}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium mb-2">Total Reservations</h3>
          <p className="text-3xl font-bold">{stats.totalReservations}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium mb-2">Today's Reservations</h3>
          <p className="text-3xl font-bold">{stats.todayReservations}</p>
        </div>
      </div>

      <div className="grid grid-2 gap-6">
        <Link href="/staff/orders">
          <div className="card" style={{ cursor: 'pointer' }}>
            <h2 className="text-2xl font-semibold mb-2">Manage Orders</h2>
            <p>View and update order statuses</p>
          </div>
        </Link>
        <Link href="/staff/reservations">
          <div className="card" style={{ cursor: 'pointer' }}>
            <h2 className="text-2xl font-semibold mb-2">Manage Reservations</h2>
            <p>View and manage table reservations</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
