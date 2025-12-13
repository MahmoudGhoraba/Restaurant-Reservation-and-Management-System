'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MenuItem } from '@/types';

export default function AdminMenuPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    availability: true,
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

    fetchMenuItems();
  }, [router]);

  const fetchMenuItems = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: MenuItem[] }>('/menuitems');
      if (response.data) {
        setMenuItems(response.data.data || []);
      }
    } catch (err) {
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Convert price to number and validate
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a number greater than or equal to 0');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: priceNum,
      category: formData.category,
      imageUrl: formData.imageUrl || undefined,
      availability: formData.availability,
    };

    try {
      if (editingItem) {
        const response = await apiClient.put<{ success: boolean; data: MenuItem }>(
          `/menuitems/${editingItem._id}`,
          payload
        );
        if (response.error) {
          setError(response.error);
          return;
        }
      } else {
        const response = await apiClient.post<{ success: boolean; data: MenuItem }>(
          '/menuitems',
          payload
        );
        if (response.error) {
          setError(response.error);
          return;
        }
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '',
        availability: true,
      });
      fetchMenuItems();
    } catch (err) {
      setError('Failed to save menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl || '',
      availability: item.availability ?? item.available ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await apiClient.delete<{ success: boolean }>(`/menuitems/${id}`);
      if (response.error) {
        setError(response.error);
        return;
      }
      fetchMenuItems();
    } catch (err) {
      setError('Failed to delete menu item');
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
        <h1 className="text-4xl font-bold">Manage Menu</h1>
        <Button onClick={() => {
          setEditingItem(null);
          setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            imageUrl: '',
            availability: true,
          });
          setShowForm(true);
        }} variant="primary">
          Add Menu Item
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
            {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-2 gap-4">
              <Input
                label="Name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Category"
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <Input
                label="Price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <Input
                label="Image URL (Optional)"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-textarea"
                rows={3}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="availability"
                checked={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                className="form-checkbox"
              />
              <label htmlFor="availability" className="text-sm font-medium">
                Available
              </label>
            </div>
            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                {editingItem ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-3 gap-6">
        {menuItems.map((item) => (
          <div key={item._id} className="card">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="img-responsive img-cover" style={{ width: '100%', height: '12rem', objectFit: 'cover' }} />
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
                  className={`badge ${
                    (item.availability ?? item.available ?? true)
                      ? 'badge-success'
                      : 'badge-error'
                  }`}
                >
                  {(item.availability ?? item.available ?? true) ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(item._id!)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
