# Restaurant API - Postman Test Collections

This directory contains comprehensive Postman test collections for the Restaurant Reservation and Management System API.

## 📦 Test Collections Overview

### Part 1: Menu Items (`postman-tests-part1-menu-items.json`)
**Focus**: Menu item CRUD operations
- Health check endpoint
- Simple menu item operations (GET, POST, PUT, DELETE)
- Validation tests (missing fields, negative prices, boundary values)
- Edge cases (zero price, invalid IDs, non-existent items)
- Authorization tests

### Part 2: Reservations (`postman-tests-part2-reservations.json`)
**Focus**: Reservation management
- Create reservations (customer authenticated)
- Get all reservations and personal reservations
- Validation tests (missing fields, invalid time format, invalid guest count)
- Boundary tests (minimum/maximum duration)
- Update and cancel operations
- Admin-specific operations (confirm, delete)

### Part 3: Orders (`postman-tests-part3-orders.json`)
**Focus**: Order processing
- Simple takeaway orders
- Different order types (Takeaway, Delivery, Dine-In)
- Orders with tables and reservations
- Validation tests (empty items, missing customer ID)
- Large quantity and multiple items
- Order status management
- Payment linking

### Part 4: Customer Features (`postman-tests-part4-customer.json`)
**Focus**: Customer-facing endpoints
- Browse menu (no authentication required)
- Place orders (simple to complex)
- Track orders
- Submit feedback with rating validation (1-5)
- Edge cases (long comments, invalid ratings)

### Part 5: Integration Workflows (`postman-tests-part5-workflows.json`)
**Focus**: Complete end-to-end scenarios
1. **Simple Takeaway Order**: Browse → Order → Track → Complete → Feedback
2. **Dine-In with Reservation**: Reserve → Confirm → Order → Complete → Feedback
3. **Admin Menu Management**: Create items → Update → Manage availability
4. **Reservation Modification**: Create → Update → Cancel
5. **Large Multi-Item Order**: Complex order with 10+ items and full lifecycle

## 🚀 Setup Instructions

### Prerequisites
1. **Install Postman**: Download from [postman.com](https://www.postman.com/downloads/)
2. **Start the Backend Server**:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
   Server should run on `http://localhost:3000`

### Import Collections

#### Option 1: Import All at Once
1. Open Postman
2. Click **Import** button
3. Select all 5 JSON files:
   - `postman-tests-part1-menu-items.json`
   - `postman-tests-part2-reservations.json`
   - `postman-tests-part3-orders.json`
   - `postman-tests-part4-customer.json`
   - `postman-tests-part5-workflows.json`
4. Click **Import**

#### Option 2: Import One by One
1. Open Postman
2. Click **Import** → Select file → **Import**
3. Repeat for each collection

## ⚙️ Configuration

### Environment Variables
Each collection uses the following variables. Set them in Postman:

```
baseUrl = http://localhost:3000
adminToken = <your-admin-jwt-token>
customerToken = <your-customer-jwt-token>
menuItemId = <auto-set-by-tests>
orderId = <auto-set-by-tests>
reservationId = <auto-set-by-tests>
tableId = <your-table-id>
paymentId = <your-payment-id>
customerId = <your-customer-id>
```

### Required Setup Before Running Tests

#### 1. Create Admin and Customer Users
You'll need to create users with JWT tokens. If you have auth endpoints:

**Admin User**:
```json
POST /auth/register or /auth/signup
{
  "name": "Admin User",
  "email": "admin@restaurant.com",
  "password": "admin123",
  "role": "Admin"
}
```

**Customer User**:
```json
POST /auth/register or /auth/signup
{
  "name": "John Doe",
  "email": "customer@example.com",
  "password": "customer123",
  "role": "Customer"
}
```

Then login to get JWT tokens and set them in collection variables.

#### 2. Create a Table (Required for Reservations)
```json
POST /tables (if endpoint exists)
{
  "capacity": 4,
  "location": "Main Hall"
}
```
Save the returned `_id` as `tableId` variable.

#### 3. Create a Payment ID (Optional)
If you have payment endpoints, create a payment and use its ID.

## 📝 Running Tests

### Run Individual Collections
1. Select a collection (e.g., "Part 1: Menu Items")
2. Click **Run** button
3. Select requests to run
4. Click **Run [Collection Name]**

### Run All Tests in Sequence
For complete integration testing:
1. Start with **Part 1** (Menu Items) to create test data
2. Run **Part 2** (Reservations) with valid table ID
3. Run **Part 3** (Orders) with valid customer and menu items
4. Run **Part 4** (Customer Features)
5. Run **Part 5** (Integration Workflows) for end-to-end scenarios

### Automated Test Execution
Collections include test scripts that:
- ✅ Validate response status codes
- ✅ Check response structure
- ✅ Verify data integrity
- ✅ Auto-save IDs for dependent requests

## 🧪 Test Coverage

### Simple Cases (Beginner Level)
- Basic CRUD operations
- Single item operations
- Standard success paths

### Intermediate Cases
- Multiple items
- Different order types
- User roles and permissions
- Partial updates

### Advanced Cases
- Boundary value testing (min/max values)
- Validation errors
- Missing required fields
- Invalid data formats

### Edge Cases (Expert Level)
- Large quantities (100+ items)
- Complex multi-item orders (10+ different items)
- Empty arrays
- Non-existent IDs
- Malformed data
- Long text inputs
- Concurrent operations simulation

### Integration Scenarios
- Complete customer journey (browse → order → track → feedback)
- Reservation-based dining flow
- Admin management workflows
- Order lifecycle (pending → preparing → ready → completed)

## 📊 Expected Test Results

### Part 1: ~15 tests
- ✅ Health check
- ✅ CRUD operations
- ✅ Validation errors
- ✅ Authorization checks

### Part 2: ~15 tests
- ✅ Reservation creation
- ✅ Updates and cancellations
- ✅ Time/date validations
- ✅ Role-based access

### Part 3: ~20 tests
- ✅ Different order types
- ✅ Order status transitions
- ✅ Payment linking
- ✅ Validation rules

### Part 4: ~15 tests
- ✅ Customer operations
- ✅ Feedback system
- ✅ Order tracking
- ✅ Menu browsing

### Part 5: ~30 requests
- ✅ 5 complete workflows
- ✅ End-to-end scenarios
- ✅ Integration testing

## 🐛 Troubleshooting

### Common Issues

**❌ "Unauthorized" errors**
- Solution: Ensure `adminToken` and `customerToken` are set correctly
- Tokens may expire - generate new ones

**❌ "Table not found" errors**
- Solution: Create a table first and set `tableId` variable

**❌ "Menu item not found"**
- Solution: Run Part 1 tests first to create menu items
- Or manually create menu items and update `menuItemId` variables

**❌ "Customer not authenticated"**
- Solution: Ensure customer ID is valid in order requests
- Set `customerId` variable properly

**❌ Connection errors**
- Solution: Verify backend server is running on port 3000
- Check `baseUrl` variable is set to `http://localhost:3000`

## 🎯 Best Practices

1. **Run in Order**: Execute collections sequentially (Part 1 → Part 5)
2. **Clean State**: Consider resetting database between full test runs
3. **Review Logs**: Check Postman console for detailed error messages
4. **Update Variables**: Keep collection variables up to date
5. **Save Responses**: Use Postman's response saving for debugging

## 📈 Extending Tests

To add new tests:
1. Duplicate an existing request
2. Modify the request body/params
3. Update test scripts as needed
4. Follow naming convention: `[Action] - [Description] ([Context])`

Example:
```
Create Order - With Special Instructions (Edge Case)
```

## 📞 Support

For issues or questions:
- Check the main `README.md` in the backend folder
- Review API documentation
- Examine response error messages in Postman console

---

**Happy Testing! 🚀**
