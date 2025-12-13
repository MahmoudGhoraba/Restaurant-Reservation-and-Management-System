'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalReservations: 0,
    todayReservations: 0,
    totalMenuItems: 0,
    totalTables: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = auth.getUser();
    if (user?.role?.toLowerCase() !== 'admin') {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const [ordersRes, reservationsRes, menuRes, tablesRes] = await Promise.all([
          apiClient.get<{ status: string; results: number; data: any[] }>('/orders'),
          apiClient.get<{ status: string; results: number; data: any[] }>('/reservations'),
          apiClient.get<{ success: boolean; data: any[] }>('/menuitems'),
          apiClient.get<{ success: boolean; data: any[] }>('/tables'),
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

        if (menuRes.data) {
          setStats((prev) => ({
            ...prev,
            totalMenuItems: menuRes.data.data?.length || 0,
          }));
        }

        if (tablesRes.data) {
          setStats((prev) => ({
            ...prev,
            totalTables: tablesRes.data.data?.length || 0,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Reservations</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalReservations}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Today's Reservations</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.todayReservations}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Menu Items</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalMenuItems}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Tables</h3>
          <p className="text-3xl font-bold text-pink-600">{stats.totalTables}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/orders">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-2xl font-semibold mb-2">Manage Orders</h2>
            <p className="text-gray-600">View and update order statuses</p>
          </div>
        </Link>
        <Link href="/admin/menu">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-2xl font-semibold mb-2">Manage Menu</h2>
            <p className="text-gray-600">Add, edit, and delete menu items</p>
          </div>
        </Link>
        <Link href="/admin/tables">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-2xl font-semibold mb-2">Manage Tables</h2>
            <p className="text-gray-600">Manage restaurant tables</p>
          </div>
        </Link>
        <Link href="/admin/reservations">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-2xl font-semibold mb-2">Manage Reservations</h2>
            <p className="text-gray-600">View and manage reservations</p>
          </div>
        </Link>
        <Link href="/admin/reports">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-2xl font-semibold mb-2">Reports</h2>
            <p className="text-gray-600">Generate and view reports</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
