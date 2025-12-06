# Postman Testing Guide

This guide will help you test all the API routes in the Restaurant Reservation and Management System using Postman.

## Files Included

1. **Restaurant_API.postman_collection.json** - Complete Postman collection with all API routes
2. **Restaurant_API.postman_environment.json** - Environment variables for easy configuration

## Setup Instructions

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button (top left)
3. Import both files:
   - `Restaurant_API.postman_collection.json`
   - `Restaurant_API.postman_environment.json`
4. Select the environment "Restaurant API - Local" from the environment dropdown (top right)

### 2. Configure Environment Variables

The environment file includes these variables:
- `baseUrl` - API base URL (default: `http://localhost:3000`)
- `authToken` - JWT token (automatically set after login)
- `customerId`, `menuItemId`, `orderId`, `reservationId`, `tableId`, `reportId` - IDs for testing

You can update `baseUrl` if your server runs on a different port or host.

## Testing Workflow

### Step 1: Authentication

1. **Register a new user** (optional if you already have an account)
   - Go to `Auth > Register`
   - Update the request body with your details
   - Send the request

2. **Login**
   - Go to `Auth > Login`
   - Update email and password in the request body
   - Send the request
   - The `authToken` will be automatically saved to the environment (via test script)

### Step 2: Test Public Endpoints

These endpoints don't require authentication:
- `Customers > Browse Menu`
- `Menu Items > Get All Menu Items`
- `Menu Items > Get Menu Item By ID`
- `Tables > Get All Tables`
- `Tables > Get Available Tables`
- `Reservations > Get All Reservations`
- `Reservations > Get Reservation By ID`
- `Orders > Get Order By ID`

### Step 3: Test Customer Endpoints

Requires authentication (use the token from login):
- `Customers > Place Order` (DineIn, Takeaway, or Delivery variants)
- `Customers > Track Order`
- `Customers > Give Feedback`

### Step 4: Test Admin/Staff Endpoints

Requires authentication with Admin or Staff role:
- `Menu Items > Create Menu Item`
- `Menu Items > Update Menu Item`
- `Menu Items > Delete Menu Item`
- `Tables > Create Table`
- `Tables > Update Table`
- `Tables > Delete Table`
- `Orders > Get All Orders` (Staff/Admin)
- `Reservations > Confirm Reservation` (Admin)
- `Reservations > Delete Reservation` (Admin)
- `Reports > Generate Report` (Admin)
- `Reports > Get All Reports` (Admin)
- `Reports > Get Report By ID` (Admin)
- `Reports > Delete Report` (Admin)

## Request Body Examples

### Register
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": 1234567890,
  "role": "Customer"
}
```

### Login
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Create Menu Item
```json
{
  "name": "Grilled Salmon",
  "description": "Fresh Atlantic salmon grilled to perfection",
  "price": 24.99,
  "availability": true,
  "imageUrl": "https://example.com/salmon.jpg",
  "category": "Main Course"
}
```

### Place Order (DineIn)
```json
{
  "items": [
    {
      "menuItem": "menuItemId1",
      "quantity": 2,
      "specialInstructions": "No onions"
    }
  ],
  "orderType": "DineIn",
  "paymentType": "Card",
  "reservationId": "reservationId123"
}
```

### Create Reservation
```json
{
  "table": "tableId123",
  "reservationDate": "2024-12-25",
  "reservationTime": "19:00",
  "numberOfGuests": 4,
  "duration": 120
}
```

### Create Table
```json
{
  "capacity": 4,
  "location": "Window Side"
}
```

### Generate Report
```json
{
  "reportType": "Sales",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "staffId": null,
  "tableId": null
}
```

## Important Notes

1. **Authentication**: Most endpoints require a JWT token. The login request automatically saves the token to the environment variable `authToken`.

2. **Role-Based Access**: Some endpoints require specific roles:
   - Admin-only: Menu items CRUD, Tables CRUD, Reports, Reservation confirmation/deletion
   - Staff/Admin: Get all orders
   - Customer: Place orders, track orders, give feedback, manage own reservations

3. **Path Variables**: Update path variables (like `:id`, `:orderId`) in the URL or use the collection variables.

4. **Date Format**: Use ISO date format (YYYY-MM-DD) for dates.

5. **Time Format**: Use 24-hour format (HH:MM) for times, e.g., "19:00".

6. **Order Types**: Valid values are `Takeaway`, `DineIn`, `Delivery`.

7. **Payment Types**: Valid values are `Cash`, `Card`, `Online`.

8. **Order Status**: Valid values are `Pending`, `Preparing`, `Served`, `Completed`.

9. **Report Types**: Valid values are `Sales`, `Reservation`, `Staff Performance`, `Feedback`.

## Troubleshooting

- **401 Unauthorized**: Make sure you're logged in and the `authToken` is set in the environment.
- **403 Forbidden**: Check if your user has the required role (Admin/Staff).
- **404 Not Found**: Verify the IDs in path variables are correct.
- **400 Bad Request**: Check the request body format and required fields.

## Collection Structure

The collection is organized into folders:
- **Auth** - Authentication endpoints
- **Customers** - Customer-facing endpoints
- **Menu Items** - Menu item management
- **Orders** - Order management
- **Reservations** - Reservation management
- **Tables** - Table management
- **Reports** - Report generation and management

Happy Testing! 🚀

