'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Table } from '@/types';

export default function AdminTablesPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    capacity: '',
    location: '',
  });

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

    fetchTables();
  }, [router]);

  const fetchTables = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Table[] }>('/tables');
      if (response.data) {
        setTables(response.data.data || []);
      }
    } catch (err) {
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Convert capacity to number and validate
    const capacityNum = parseInt(formData.capacity);
    if (isNaN(capacityNum) || capacityNum < 1) {
      setError('Capacity must be a number greater than 0');
      return;
    }

    const payload = {
      capacity: capacityNum,
      location: formData.location,
    };

    try {
      if (editingTable) {
        const response = await apiClient.put<{ success: boolean; data: Table }>(
          `/tables/${editingTable._id}`,
          payload
        );
        if (response.error) {
          setError(response.error);
          return;
        }
      } else {
        const response = await apiClient.post<{ success: boolean; data: Table }>(
          '/tables',
          payload
        );
        if (response.error) {
          setError(response.error);
          return;
        }
      }

      setShowForm(false);
      setEditingTable(null);
      setFormData({
        capacity: '',
        location: '',
      });
      fetchTables();
    } catch (err) {
      setError('Failed to save table');
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      capacity: table.capacity.toString(),
      location: table.location,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      const response = await apiClient.delete<{ success: boolean }>(`/tables/${id}`);
      if (response.error) {
        setError(response.error);
        return;
      }
      fetchTables();
    } catch (err) {
      setError('Failed to delete table');
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
        <h1 className="text-4xl font-bold">Manage Tables</h1>
        <Button onClick={() => {
          setEditingTable(null);
          setFormData({
            capacity: '',
            location: '',
          });
          setShowForm(true);
        }} variant="primary">
          Add Table
        </Button>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editingTable ? 'Edit Table' : 'Add Table'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-2 gap-4">
              <Input
                label="Capacity"
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
              <Input
                label="Location"
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                {editingTable ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingTable(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-3 gap-6">
        {tables.map((table) => (
          <div key={table._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">Table {table._id?.slice(-6) || 'N/A'}</h3>
                <p className="text-sm mt-1">Location: {table.location}</p>
              </div>
            </div>
            <p className="mb-4">
              <span className="font-medium">Capacity:</span> {table.capacity} guests
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(table)}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(table._id!)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
