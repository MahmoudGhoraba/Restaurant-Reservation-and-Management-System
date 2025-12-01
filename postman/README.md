# Postman Collection for Restaurant Reservation & Management API

This directory contains Postman collections and environment files for testing the Restaurant Reservation and Management System API.

## Files

- `Restaurant-API.postman_collection.json` - Complete API collection with all endpoints
- `Restaurant-API.postman_environment.json` - Environment variables for API testing
- `README.md` - This file

## Setup Instructions

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button (top left)
3. Import both files:
   - `Restaurant-API.postman_collection.json`
   - `Restaurant-API.postman_environment.json`
4. Select the **Restaurant API Environment** from the environment dropdown (top right)

### 2. Configure Environment Variables

Update the following variables in the environment:

- `base_url` - Your API base URL (default: `http://localhost:5000`)
- `user_email` - Test customer email
- `user_password` - Test customer password
- `admin_email` - Admin user email
- `admin_password` - Admin user password

### 3. Authentication Flow

Most endpoints require authentication. Follow these steps:

1. **Register a User** (optional if users already exist)
   - Go to `Authentication` → `Register User`
   - Or `Register Admin` for admin access

2. **Login**
   - Go to `Authentication` → `Login`
   - The `auth_token` will be automatically saved to environment variables
   - Update the email/password in the request body or environment variables

3. **Use Authenticated Endpoints**
   - All authenticated endpoints use Bearer token authentication
   - The token is automatically included from the `auth_token` environment variable

## Collection Structure

The collection is organized into the following folders:

### 1. Authentication
- Register User
- Register Admin
- Login
- Forgot Password
- Reset Password

### 2. Users
- Get User Profile
- Get All Users (Admin)
- Get User By ID (Admin)

### 3. Customers
- Browse Menu
- Place Order
- Track Order
- Give Feedback

### 4. Reservations
- Health Check
- Get All Reservations
- Get My Reservations
- Create Reservation
- Get Reservation By ID
- Update Reservation
- Cancel Reservation
- Confirm Reservation (Admin)

### 5. Orders
- Create Order
- Get All Orders (Admin/Staff)
- Get Order By ID
- Update Order Status (Admin/Staff)
- Delete Order

### 6. Payments
- Process Payment
- Get All Payments
- Get Payment By ID
- Get Payments By Order
- Update Payment Status

### 7. Menu Items
- Create Menu Item (Admin - Main Admin only)
- Get Menu Item By ID
- Update Menu Item (Admin - Main Admin only)
- Delete Menu Item (Admin - Main Admin only)

### 8. Tables
- Create Table
- Get All Tables
- Get Available Tables
- Get Table By ID
- Check Table Availability
- Update Table
- Delete Table

### 9. Feedback
- Create Feedback
- Get Feedback By ID
- Update Feedback
- Get All Feedback (Admin)
- Delete Feedback (Admin)

### 10. Reports
- Generate Report
- Get Report By ID
- Get All Reports (Admin)
- Delete Report (Admin)

## Testing Features

Each request includes automated tests that verify:
- HTTP status codes
- Response structure
- Response data presence

### Automatic Variable Setting

The collection automatically saves IDs from responses to environment variables:
- `auth_token` - From login response
- `user_id` - From user registration
- `order_id` - From order creation
- `reservation_id` - From reservation creation
- `payment_id` - From payment processing
- `menu_item_id` - From menu item creation
- `table_id` - From table creation
- `feedback_id` - From feedback creation
- `report_id` - From report generation

These variables are used in subsequent requests automatically.

## Role-Based Access

The API has different access levels:

- **Public**: Some endpoints don't require authentication (e.g., Browse Menu, Health Check)
- **Customer**: Requires authentication with Customer role
- **Staff**: Requires authentication with Staff role
- **Admin**: Requires authentication with Admin role
  - **Main Admin**: Some endpoints require Main Admin level specifically

## Common Workflows

### Customer Workflow
1. Register User (Customer role)
2. Login
3. Browse Menu
4. Create Reservation
5. Create Order
6. Process Payment
7. Track Order
8. Give Feedback

### Admin Workflow
1. Register Admin (with adminLevel: "Main Admin")
2. Login
3. Create Menu Items
4. Create Tables
5. Get All Orders
6. Update Order Status
7. Confirm Reservations
8. Generate Reports

## API Base URL

The default base URL is `http://localhost:5000`. Update the `base_url` environment variable to point to your server.

## Notes

- All dates should be in ISO format (YYYY-MM-DD)
- Time format is HH:MM (24-hour format)
- JWT tokens expire after 30 minutes (you'll need to login again)
- Payment methods: "Cash", "Card", "Online"
- Order statuses: "Pending", "Preparing", "Served", "Completed"
- Payment statuses: "Paid", "Pending", "Refunded"
- Admin levels: "Main Admin", "Manager Admin"

## Troubleshooting

### 401 Unauthorized
- Make sure you've logged in and the `auth_token` is set
- Token may have expired - login again
- Check that the token is being sent in the Authorization header

### 403 Forbidden
- Check your user role matches the required role for the endpoint
- For Main Admin endpoints, ensure `adminLevel` is "Main Admin"

### 404 Not Found
- Verify the ID exists in your database
- Check that the ID format is correct (MongoDB ObjectId)

### 400 Bad Request
- Verify request body matches the expected format
- Check required fields are provided
- Validate data types (dates, numbers, etc.)

## Running the Collection

You can run the entire collection using Postman's Collection Runner:

1. Click on the collection
2. Click **Run**
3. Select requests to run
4. Configure iterations and delays
5. Click **Run Restaurant Reservation & Management API**

This will execute all requests sequentially and show test results.

