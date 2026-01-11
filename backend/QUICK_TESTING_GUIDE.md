# 🧪 Manual Testing Guide - Quick Start

## ✅ Server Status
**Server is running on:** `http://localhost:3000`
**MongoDB:** Connected successfully

---

## 🔐 Authentication Endpoints - TEST THESE FIRST

### 1️⃣ **Register a Customer**
```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "John Customer",
  "email": "customer@test.com",
  "password": "Test123!",
  "phone": 1234567890,
  "role": "Customer"
}
```
**Expected Response:** 201 Created with user object and JWT token

---

### 2️⃣ **Register an Admin**
```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "Admin123!",
  "phone": 9876543210,
  "role": "Admin"
}
```
**Expected Response:** 201 Created with user object and JWT token

---

### 3️⃣ **Login**
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "Test123!"
}
```
**Expected Response:** 200 OK with user object and JWT token
**Save the token** - you'll need it for authenticated requests!

---

### 4️⃣ **Forgot Password**
```http
POST http://localhost:3000/auth/forgot-password
Content-Type: application/json

{
  "email": "customer@test.com"
}
```
**Expected Response:** 200 OK with message and OTP (check server console for OTP)
**Note:** OTP is returned in response for testing (in production it would be emailed)

---

### 5️⃣ **Reset Password**
```http
POST http://localhost:3000/auth/reset-password
Content-Type: application/json

{
  "email": "customer@test.com",
  "otp": "123456",
  "newPassword": "NewPassword123!"
}
```
**Expected Response:** 200 OK with success message
**Use the OTP from step 4**

---

### 6️⃣ **Get Profile** (Authenticated)
```http
GET http://localhost:3000/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```
**Expected Response:** 200 OK with user profile

---

### 7️⃣ **Update Profile** (Authenticated)
```http
PUT http://localhost:3000/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "name": "John Updated",
  "phone": 5551234567
}
```
**Expected Response:** 200 OK with updated user

---

### 8️⃣ **Change Password** (Authenticated)
```http
PUT http://localhost:3000/auth/change-password
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "Test123!",
  "newPassword": "NewTest123!"
}
```
**Expected Response:** 200 OK with success message

---

## 👤 Customer Endpoints (After Login)

### 🍽️ **Browse Menu** (Public - No Auth Needed)
```http
GET http://localhost:3000/customers/menu
```
**What it does:** View all available menu items
**Expected:** List of menu items (may be empty initially)

---

### 🛒 **Place Order** (Requires Customer Auth)
```http
POST http://localhost:3000/customers/order
Authorization: Bearer YOUR_CUSTOMER_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "menuItem": "MENU_ITEM_ID_HERE",
      "quantity": 2,
      "specialInstructions": "Extra spicy"
    }
  ],
  "orderType": "Takeaway"
}
```
**What it does:** Customer places a new order
**Expected:** 201 Created with order details
**Note:** You need menu items created first (admin function)

---

### 📦 **Track Order** (Requires Customer Auth)
```http
GET http://localhost:3000/customers/order/ORDER_ID_HERE
Authorization: Bearer YOUR_CUSTOMER_TOKEN
```
**What it does:** Track status of a specific order
**Expected:** Order details with current status

---

### ⭐ **Give Feedback** (Requires Customer Auth)
```http
POST http://localhost:3000/customers/feedback
Authorization: Bearer YOUR_CUSTOMER_TOKEN
Content-Type: application/json

{
  "orderId": "ORDER_ID_HERE",
  "rating": 5,
  "comment": "Excellent food and service!"
}
```
**What it does:** Submit feedback for a completed order
**Expected:** 201 Created with feedback confirmation

---

## 🍕 Menu Management (Admin Only)

### **Create Menu Item** (Admin Auth Required)
```http
POST http://localhost:3000/menuitems
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato and mozzarella",
  "price": 12.99,
  "category": "Pizza",
  "available": true
}
```

---

### **View All Menu Items** (Public)
```http
GET http://localhost:3000/menuitems
```

---

### **Update Menu Item** (Admin Only)
```http
PUT http://localhost:3000/menuitems/MENU_ITEM_ID
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "price": 14.99,
  "available": true
}
```

---

### **Delete Menu Item** (Admin Only)
```http
DELETE http://localhost:3000/menuitems/MENU_ITEM_ID
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 📅 Reservation System

### **Create Reservation** (Customer Auth)
```http
POST http://localhost:3000/reservations
Authorization: Bearer YOUR_CUSTOMER_TOKEN
Content-Type: application/json

{
  "date": "2025-12-10",
  "time": "19:00",
  "numberOfGuests": 4,
  "specialRequests": "Window seat preferred"
}
```

---

### **View My Reservations** (Customer Auth)
```http
GET http://localhost:3000/reservations/my-reservations
Authorization: Bearer YOUR_CUSTOMER_TOKEN
```

---

### **Cancel Reservation** (Customer Auth)
```http
DELETE http://localhost:3000/reservations/RESERVATION_ID/cancel
Authorization: Bearer YOUR_CUSTOMER_TOKEN
```

---

### **Confirm Reservation** (Admin Only)
```http
PUT http://localhost:3000/reservations/RESERVATION_ID/confirm
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 🧪 Testing Workflow

### **Phase 1: Authentication** ⬅️ START HERE
1. ✅ Register a customer account
2. ✅ Register an admin account
3. ✅ Login with customer credentials → Save token
4. ✅ Login with admin credentials → Save admin token
5. ✅ Test forgot password flow
6. ✅ Test reset password
7. ✅ Test get/update profile

### **Phase 2: Admin Sets Up Restaurant**
1. Login as Admin
2. Create 3-5 menu items (pizzas, drinks, desserts)
3. View all menu items

### **Phase 3: Customer Experience**
1. Login as Customer
2. Browse menu (public endpoint)
3. Create a reservation
4. View my reservations
5. Place an order (using menu item IDs from Phase 2)
6. Track the order
7. Give feedback on order

### **Phase 4: Integration Testing**
1. Admin confirms customer reservation
2. Admin updates order status
3. Customer tracks updated order
4. Customer cancels a reservation

---

## 📊 Available Endpoints Summary

### **Authentication (8 endpoints)**
- ✅ POST `/auth/register`
- ✅ POST `/auth/login`
- ✅ POST `/auth/forgot-password`
- ✅ POST `/auth/reset-password`
- ✅ GET `/auth/profile`
- ✅ PUT `/auth/profile`
- ✅ PUT `/auth/change-password`
- ✅ POST `/auth/logout`

### **Customer Features (4 endpoints)**
- ✅ GET `/customers/menu` - Browse menu
- ✅ POST `/customers/order` - Place order
- ✅ GET `/customers/order/:orderId` - Track order
- ✅ POST `/customers/feedback` - Give feedback

### **Menu Management (5 endpoints)**
- ✅ POST `/menuitems` - Create (Admin)
- ✅ GET `/menuitems` - View all (Public)
- ✅ GET `/menuitems/:id` - View one (Public)
- ✅ PUT `/menuitems/:id` - Update (Admin)
- ✅ DELETE `/menuitems/:id` - Delete (Admin)

### **Reservations (8 endpoints)**
- ✅ POST `/reservations` - Create
- ✅ GET `/reservations` - View all (Admin)
- ✅ GET `/reservations/my-reservations` - My reservations (Customer)
- ✅ GET `/reservations/:id` - View one
- ✅ PUT `/reservations/:id` - Update
- ✅ DELETE `/reservations/:id/cancel` - Cancel (Customer)
- ✅ PUT `/reservations/:id/confirm` - Confirm (Admin)
- ✅ DELETE `/reservations/:id` - Delete (Admin)

### **Orders (6 endpoints)**
- ✅ POST `/orders` - Create
- ✅ GET `/orders` - View all
- ✅ GET `/orders/:id` - View one
- ✅ PUT `/orders/:id/status` - Update status
- ✅ DELETE `/orders/:id` - Delete
- ✅ PUT `/orders/:id/payment` - Link payment

---

## 🔧 Tools for Testing

### Option 1: Postman (Recommended)
Import the test collections I created:
- `postman-tests-part0-authentication.json` ⬅️ Start here

### Option 2: VS Code REST Client
Install "REST Client" extension and create a `.http` file with the requests above

### Option 3: cURL
```bash
# Example: Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!","role":"Customer"}'
```

### Option 4: Browser Dev Tools (for GET requests)
Just visit: `http://localhost:3000/menuitems`

---

## 🎯 Quick Test Checklist

- [ ] Register customer account
- [ ] Register admin account  
- [ ] Login and get token
- [ ] Forgot password → get OTP from console
- [ ] Reset password with OTP
- [ ] Login with new password
- [ ] Get profile (with auth token)
- [ ] Update profile
- [ ] Admin creates menu items
- [ ] Customer browses menu
- [ ] Customer creates reservation
- [ ] Customer places order
- [ ] Customer tracks order
- [ ] Customer gives feedback

---

**Ready to test!** 🚀 Start with the authentication endpoints and let me know what you find!
