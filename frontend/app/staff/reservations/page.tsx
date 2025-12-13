'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import type { Reservation, Table } from '@/types';

export default function StaffReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Record<string, Table>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');

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
        const [reservationsRes, tablesRes] = await Promise.all([
          apiClient.get<{ status: string; results: number; data: Reservation[] }>('/reservations'),
          apiClient.get<{ success: boolean; data: Table[] }>('/tables'),
        ]);

        if (reservationsRes.data) {
          setReservations(reservationsRes.data.data || []);
        }

        if (tablesRes.data) {
          const tableMap: Record<string, Table> = {};
          (tablesRes.data.data || []).forEach((table) => {
            if (table._id) {
              tableMap[table._id] = table;
            }
          });
          setTables(tableMap);
        }
      } catch (err) {
        setError('Failed to load reservations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const filteredReservations = bookingStatusFilter === 'all'
    ? reservations
    : reservations.filter((r) => r.bookingStatus === bookingStatusFilter);

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
        <h1 className="text-4xl font-bold text-gray-900">Manage Reservations</h1>
        <select
          value={bookingStatusFilter}
          onChange={(e) => setBookingStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Reservations</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="canceled">Canceled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {filteredReservations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No reservations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReservations.map((reservation) => {
            const table = tables[reservation.tableId];
            return (
              <div
                key={reservation._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Reservation #{reservation._id?.slice(-8)}
                    </h3>
                    {table && (
                      <p className="text-sm text-gray-600 mt-1">
                        Table {table.tableNumber} (Capacity: {table.capacity})
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reservation.bookingStatus === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : reservation.bookingStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : reservation.bookingStatus === 'canceled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {reservation.bookingStatus}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(reservation.reservationDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Time:</span> {reservation.reservationTime}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Guests:</span> {reservation.numberOfGuests}
                  </p>
                  {reservation.specialRequests && (
                    <p className="text-gray-700">
                      <span className="font-medium">Special Requests:</span>{' '}
                      {reservation.specialRequests}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
