# Restaurant Reservation Backend (TypeScript)

This is the backend service for the Restaurant Reservation and Management System, built with Node.js, Express, MongoDB, and TypeScript.

## 🚀 Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

## 📦 Project Structure

```
backend/
├── src/
│   ├── application/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # Route definitions
│   │   └── services/        # Business logic
│   ├── data/
│   │   └── models/          # Mongoose models
│   ├── infrastructure/
│   │   ├── db.ts           # Database connection
│   │   └── utils/          # Utility functions
│   └── types/              # TypeScript type definitions
├── app.ts                  # Application entry point
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
DB_URL=mongodb://localhost:27017/restaurant-db
```

## 📝 Available Scripts

### Development Mode
Run the application with hot-reload using `ts-node` and `nodemon`:
```bash
npm run dev
```

### Build
Compile TypeScript to JavaScript:
```bash
npm run build
```

### Production Mode
Run the compiled JavaScript:
```bash
npm start
```

### Clean Build
Remove the `dist` folder:
```bash
npm run clean
```

## 🔧 TypeScript Configuration

The project uses strict TypeScript settings for better type safety:
- Strict null checks
- Strict function types
- No implicit any
- Source maps enabled
- Declaration files generated

## 📚 API Endpoints

### Orders
- `POST /orders` - Create a new order
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `PATCH /orders/:id/status` - Update order status
- `DELETE /orders/:id` - Delete an order

## 🎯 Type Definitions

Custom types are defined in the `src/types/` directory:
- `order.types.ts` - Order-related interfaces
- `express.d.ts` - Express request extensions

## 🔐 Environment Variables

Required environment variables:
- `PORT` - Server port (default: 5000)
- `DB_URL` - MongoDB connection string

## 📖 Development Guidelines

1. **Type Safety**: Always define types and interfaces
2. **Error Handling**: Use the `catchAsync` wrapper and `AppError` class
3. **Models**: Define Mongoose schemas with TypeScript interfaces
4. **Services**: Keep business logic in service classes
5. **Controllers**: Handle requests and responses

## 🧪 Testing

```bash
npm test
```

## 📄 License

ISC

