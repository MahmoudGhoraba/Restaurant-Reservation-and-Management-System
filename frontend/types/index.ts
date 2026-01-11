/**
 * Type definitions for the application
 */

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// Reservation types
export interface Reservation {
  _id?: string;
  customerId: string;
  tableId: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  bookingStatus: 'pending' | 'confirmed' | 'canceled';
  specialRequests?: string;
}

export interface CreateReservationDto {
  table: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  duration?: number;
  specialRequests?: string;
}

// Table types
export interface Table {
  _id?: string;
  capacity: number;
  location: string;
  tableNumber?: number; // Optional, may not exist in backend response
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance'; // Optional, may not exist in backend response
}

// Menu Item types
export interface MenuItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  availability: boolean;
  available?: boolean; // Legacy field, for backward compatibility
}

// Order types
export interface OrderItem {
  menuItem?: string | { _id?: string; name?: string; price?: number }; // Can be ObjectId or populated object
  menuItemId?: string; // Legacy field
  quantity: number;
  subTotal?: number;
  specialInstructions?: string;
  name?: string; // If populated, menuItem might have name directly
  price?: number; // If populated, menuItem might have price directly
}

export interface Order {
  _id?: string;
  customerId?: string;
  customer?: string | { _id?: string; name?: string };
  items: OrderItem[];
  totalAmount?: number;
  status: 'Pending' | 'Preparing' | 'Served' | 'Completed';
  orderDate: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  orderType?: 'Takeaway' | 'DineIn' | 'Delivery';
  paymentType?: 'Cash' | 'Card' | 'Online';
}

export interface CreateOrderDto {
  items: OrderItem[];
  specialInstructions?: string;
}

// Customer types
export interface Customer {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  preferences?: string[];
}

export interface Feedback {
  _id?: string;
  customerId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}
