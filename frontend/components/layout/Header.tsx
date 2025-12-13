'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      setIsAuthenticated(auth.isAuthenticated());
      setUser(auth.getUser());
    };
    checkAuth();
    
    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus (user might have logged in in another tab)
    window.addEventListener('focus', checkAuth);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  const userRole = user?.role?.toLowerCase();
  const isCustomer = userRole === 'customer';
  const isStaff = userRole === 'staff';
  const isAdmin = userRole === 'admin';

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  if (!mounted) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Restaurant Management
            </Link>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Register
              </Link>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Restaurant Management
          </Link>
          
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isCustomer && (
                  <>
                    <Link 
                      href="/menu" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Menu
                    </Link>
                    <Link 
                      href="/my-orders" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      My Orders
                    </Link>
                    <Link 
                      href="/reservations" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Reservations
                    </Link>
                  </>
                )}
                {isStaff && (
                  <>
                    <Link 
                      href="/staff/dashboard" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/staff/orders" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Orders
                    </Link>
                    <Link 
                      href="/staff/reservations" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Reservations
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link 
                      href="/admin/dashboard" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/admin/orders" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Orders
                    </Link>
                    <Link 
                      href="/admin/menu" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Menu
                    </Link>
                    <Link 
                      href="/admin/tables" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Tables
                    </Link>
                    <Link 
                      href="/admin/reservations" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Reservations
                    </Link>
                    <Link 
                      href="/admin/reports" 
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                    >
                      Reports
                    </Link>
                  </>
                )}
                <span className="text-gray-700 font-medium">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={() => {
                    auth.clearAuth();
                    window.location.href = '/login';
                  }}
                  className="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
