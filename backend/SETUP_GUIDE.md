# Restaurant Management System - Setup Guide

## Prerequisites Checklist

### ✅ **Completed:**
1. ✅ All npm packages installed
2. ✅ Authentication endpoints created (register, login, forgot/reset password, profile)
3. ✅ bcrypt installed for password hashing
4. ✅ JWT configuration ready
5. ✅ User schema updated with reset password fields

### ⚠️ **Still Required:**

#### 1. **MongoDB Database**
You need MongoDB running locally before starting the application.

**Option A: Install MongoDB Locally**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017`

**Option B: Use MongoDB Atlas (Cloud)**
- Sign up at: https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Update `.env` file with: `MONGODB_URI=your_atlas_connection_string`

**Option C: Use Docker**
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### 2. **Update JWT Secret (Optional but Recommended)**
The `.env` file has a default JWT secret. For production, change it to a strong random string:
```
JWT_SECRET=your_very_long_random_secret_key_here
```

---

## Start the Application

### 1. Make sure MongoDB is running
Check if MongoDB is running on port 27017

### 2. Start the NestJS server
```powershell
cd backend
npm run start:dev
```

### 3. Verify the server is running
You should see:
```
MongoDB Connected Successfully via Singleton
Application is running on: http://localhost:3000
```

---

## Test Endpoints

### Health Check
```
GET http://localhost:3000
```

### Authentication Endpoints Available:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP
- `GET /auth/profile` - Get user profile (requires auth)
- `PUT /auth/profile` - Update profile (requires auth)
- `PUT /auth/change-password` - Change password (requires auth)
- `POST /auth/logout` - Logout (requires auth)

### Other Endpoints:
- `/menuitem/*` - Menu management
- `/order/*` - Order management
- `/reservation/*` - Reservation management
- `/customer/*` - Customer features
- `/table/*` - Table management

---

## Import Postman Tests

1. Open Postman
2. Click **Import**
3. Import these files in order:
   - `postman-tests-part0-authentication.json` (Import FIRST!)
   - `postman-tests-part1-menu-items.json`
   - `postman-tests-part2-reservations.json`
   - `postman-tests-part3-orders.json`
   - `postman-tests-part4-customer.json`
   - `postman-tests-part5-workflows.json`
   - `postman-tests-part6-security.json`
   - `postman-tests-part7-performance.json`

4. Update collection variables:
   - `baseUrl`: http://localhost:3000
   - The tokens will be auto-populated when you run the auth tests

---

## Quick Start Testing Workflow

1. **Start MongoDB** (if not already running)
2. **Start the server:** `npm run start:dev`
3. **In Postman:**
   - Run Part 0 collection (Authentication) first
   - This will create users and save auth tokens
   - Then run other collections in any order

---

## Troubleshooting

### MongoDB Connection Error
**Error:** `MongoDB Connection Failed`
**Solution:** 
- Make sure MongoDB is installed and running
- Check the `MONGODB_URI` in `.env` file
- Test connection: `mongosh mongodb://localhost:27017/restaurant-management`

### Port Already in Use
**Error:** `Port 3000 is already in use`
**Solution:** 
- Change PORT in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000

### JWT Errors
**Error:** `Invalid token` or `No auth token`
**Solution:**
- Make sure you've run the login request first
- Check that the token is saved in collection variables
- Verify JWT_SECRET in `.env` matches

### Schema Errors
**Error:** `User validation failed`
**Solution:**
- Check that all required fields are provided
- Email must be valid format
- Password must be at least 6 characters
- Role must be: Customer, Admin, or Staff

---

## Environment Variables

Current `.env` configuration:
```env
MONGODB_URI=mongodb://localhost:27017/restaurant-management
PORT=3000
JWT_SECRET=Restaurant_Management_Secret_Key_2025_Change_In_Production_12345
```

**Note:** Change JWT_SECRET before deploying to production!

---

## Next Steps

Once everything is running:
1. ✅ Run authentication tests to create users
2. ✅ Run feature-specific tests (menu, orders, reservations)
3. ✅ Run integration workflow tests
4. ✅ Run security and performance tests
5. ✅ Review test results and fix any issues

---

## Need Help?

- Check the server console for error messages
- Review the Postman test results for failed assertions
- Verify MongoDB is accessible
- Ensure all npm packages are installed: `npm install`
