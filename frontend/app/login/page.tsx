'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import type { LoginCredentials } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post<{ token: string; user: any }>('/auth/login', formData);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const { token, user } = response.data;
        
        if (token) {
          auth.setToken(token);
        }
        
        if (user) {
          // Ensure user object has all necessary fields
          const userData = {
            id: user._id || user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
          auth.setUser(userData);
          
          // Redirect based on role
          const userRole = user.role?.toLowerCase();
          if (userRole === 'staff') {
            router.push('/staff/dashboard');
          } else if (userRole === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        } else {
          router.push('/');
        }
        
        // Force a page reload to update all components
        window.location.href = user?.role?.toLowerCase() === 'staff' 
          ? '/staff/dashboard' 
          : user?.role?.toLowerCase() === 'admin'
          ? '/admin/dashboard'
          : '/';
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold mb-2">
            Sign in to your account
          </h2>
          <p className="text-center text-sm">
            Or{' '}
            <Link href="/register" className="font-medium">
              create a new account
            </Link>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="btn-full">
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
