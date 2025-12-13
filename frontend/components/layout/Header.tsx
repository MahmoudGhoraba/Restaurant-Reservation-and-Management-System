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
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo">
              Restaurant Management
            </Link>
            <nav className="nav">
              <Link 
                href="/login" 
                className="nav-link"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn btn-primary btn-md"
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
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo">
            Restaurant Management
          </Link>
          
          <nav className="nav">
            {isAuthenticated ? (
              <>
                {isCustomer && (
                  <>
                    <Link 
                      href="/menu" 
                      className="nav-link"
                    >
                      Menu
                    </Link>
                    <Link 
                      href="/my-orders" 
                      className="nav-link"
                    >
                      My Orders
                    </Link>
                    <Link 
                      href="/reservations" 
                      className="nav-link"
                    >
                      Reservations
                    </Link>
                  </>
                )}
                {isStaff && (
                  <>
                    <Link 
                      href="/staff/dashboard" 
                      className="nav-link"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/staff/orders" 
                      className="nav-link"
                    >
                      Orders
                    </Link>
                    <Link 
                      href="/staff/reservations" 
                      className="nav-link"
                    >
                      Reservations
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link 
                      href="/admin/dashboard" 
                      className="nav-link"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/admin/orders" 
                      className="nav-link"
                    >
                      Orders
                    </Link>
                    <Link 
                      href="/admin/menu" 
                      className="nav-link"
                    >
                      Menu
                    </Link>
                    <Link 
                      href="/admin/tables" 
                      className="nav-link"
                    >
                      Tables
                    </Link>
                    <Link 
                      href="/admin/reservations" 
                      className="nav-link"
                    >
                      Reservations
                    </Link>
                    <Link 
                      href="/admin/reports" 
                      className="nav-link"
                    >
                      Reports
                    </Link>
                  </>
                )}
                <span className="font-medium">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={() => {
                    auth.clearAuth();
                    window.location.href = '/login';
                  }}
                  className="nav-link"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="nav-link"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary btn-md"
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
