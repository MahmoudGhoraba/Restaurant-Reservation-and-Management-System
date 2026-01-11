'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import type { Reservation, Table } from '@/types';

export default function AdminReservationsPage() {
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
    if (user?.role?.toLowerCase() !== 'admin') {
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

  const handleConfirm = async (id: string) => {
    try {
      const response = await apiClient.put<{ status: string; data: Reservation }>(
        `/reservations/${id}/confirm`,
        {}
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setReservations((prev) =>
          prev.map((r) => (r._id === id ? response.data!.data : r))
        );
      }
    } catch (err) {
      setError('Failed to confirm reservation');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      const response = await apiClient.delete<{ status: string; data: Reservation }>(
        `/reservations/${id}/cancel`
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setReservations((prev) =>
          prev.map((r) => (r._id === id ? response.data!.data : r))
        );
      }
    } catch (err) {
      setError('Failed to cancel reservation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;

    try {
      const response = await apiClient.delete<{ status: string }>(`/reservations/${id}`);

      if (response.error) {
        setError(response.error);
        return;
      }

      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError('Failed to delete reservation');
    }
  };

  const filteredReservations = bookingStatusFilter === 'all'
    ? reservations
    : reservations.filter((r) => r.bookingStatus === bookingStatusFilter);

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
        <h1 className="text-4xl font-bold">Manage Reservations</h1>
        <select
          value={bookingStatusFilter}
          onChange={(e) => setBookingStatusFilter(e.target.value)}
          className="form-select"
        >
          <option value="all">All Reservations</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="canceled">Canceled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {filteredReservations.length === 0 ? (
        <div className="text-center py-12 card">
          <p>No reservations found.</p>
        </div>
      ) : (
        <div className="grid grid-3 gap-6">
          {filteredReservations.map((reservation) => {
            const table = tables[reservation.tableId];
            return (
              <div
                key={reservation._id}
                className="card"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Reservation #{reservation._id?.slice(-8)}
                    </h3>
                    {table && (
                      <p className="text-sm mt-1">
                        Table {table.tableNumber} (Capacity: {table.capacity})
                      </p>
                    )}
                  </div>
                  <span
                    className={`badge ${
                      reservation.bookingStatus === 'confirmed'
                        ? 'badge-success'
                        : reservation.bookingStatus === 'pending'
                        ? 'badge-warning'
                        : reservation.bookingStatus === 'canceled'
                        ? 'badge-error'
                        : 'badge-info'
                    }`}
                  >
                    {reservation.bookingStatus}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(reservation.reservationDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {reservation.reservationTime}
                  </p>
                  <p>
                    <span className="font-medium">Guests:</span> {reservation.numberOfGuests}
                  </p>
                  {reservation.specialRequests && (
                    <p>
                      <span className="font-medium">Special Requests:</span>{' '}
                      {reservation.specialRequests}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4 flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {reservation.bookingStatus === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleConfirm(reservation._id!)}
                    >
                      Confirm
                    </Button>
                  )}
                  {reservation.bookingStatus !== 'canceled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(reservation._id!)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(reservation._id!)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
