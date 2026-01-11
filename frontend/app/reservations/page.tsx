'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Reservation, Table, CreateReservationDto } from '@/types';

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateReservationDto>({
    table: '',
    reservationDate: '',
    reservationTime: '',
    numberOfGuests: 1,
    duration: 60,
    specialRequests: '',
  });

  const fetchData = async () => {
    try {
      const [reservationsRes, tablesRes] = await Promise.all([
        apiClient.get<{ status: string; results: number; data: Reservation[] }>('/reservations/my-reservations'),
        apiClient.get<{ success: boolean; data: Table[] }>('/tables'),
      ]);

      if (reservationsRes.data) {
        setReservations(reservationsRes.data.data || []);
      }
      if (tablesRes.data) {
        setTables(tablesRes.data.data || []);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Prepare payload matching the backend DTO
    const payload = {
      table: formData.table,
      reservationDate: formData.reservationDate,
      reservationTime: formData.reservationTime,
      numberOfGuests: formData.numberOfGuests,
      duration: formData.duration || 60,
    };

    try {
      const response = await apiClient.post<{ status: string; message: string; data: Reservation }>('/reservations', payload);
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setShowForm(false);
        setFormData({
          table: '',
          reservationDate: '',
          reservationTime: '',
          numberOfGuests: 1,
          duration: 60,
          specialRequests: '',
        });
        fetchData();
      }
    } catch (err) {
      setError('Failed to create reservation');
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
        <h1 className="text-4xl font-bold">Reservations</h1>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Cancel' : 'New Reservation'}
        </Button>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create New Reservation</h2>
          <div className="grid grid-2 gap-4">
            <div>
              <label className="form-label">
                Table
              </label>
              <select
                required
                value={formData.table}
                onChange={(e) => setFormData({ ...formData, table: e.target.value })}
                className="form-select"
              >
                <option value="">Select a table</option>
                {tables.length === 0 ? (
                  <option disabled>No tables available</option>
                ) : (
                  tables.map((table) => (
                    <option key={table._id} value={table._id}>
                      {table.location} - Capacity: {table.capacity} guests
                    </option>
                  ))
                )}
              </select>
            </div>
            <Input
              label="Date"
              type="date"
              required
              value={formData.reservationDate}
              onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              required
              value={formData.reservationTime}
              onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
            />
            <Input
              label="Number of Guests"
              type="number"
              min="1"
              required
              value={formData.numberOfGuests}
              onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              min="30"
              max="480"
              value={formData.duration || 60}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
            />
            <div className="grid-1">
              <label className="form-label">
                Special Requests
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit" variant="primary">
              Create Reservation
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div className="text-center py-12 card">
            <p>No reservations found.</p>
            <p className="mt-2">
              {!showForm && (
                <>
                  <button
                    onClick={() => setShowForm(true)}
                    className="font-medium"
                    style={{ color: '#000000', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Create your first reservation
                  </button>
                </>
              )}
            </p>
          </div>
        ) : (
          reservations.map((reservation) => (
            <div
              key={reservation._id}
              className="card"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    Reservation for {reservation.numberOfGuests} guest{reservation.numberOfGuests > 1 ? 's' : ''}
                  </h3>
                  <p className="mt-2">
                    Date: {new Date(reservation.reservationDate).toLocaleDateString()}
                  </p>
                  <p>
                    Time: {reservation.reservationTime}
                  </p>
                  {reservation.specialRequests && (
                    <p className="mt-2">
                      Special Requests: {reservation.specialRequests}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
