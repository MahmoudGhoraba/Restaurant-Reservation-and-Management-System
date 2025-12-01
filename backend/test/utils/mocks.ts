/**
 * Shared test utilities and mocks for unit tests
 */

/**
 * Creates a mock Mongoose model with common methods
 */
export const createMockModel = () => {
  const mockExec = (result: any) => ({ exec: jest.fn().mockResolvedValue(result) });

  return {
    // Constructor support
    asConstructor: jest.fn((details: any) => ({
      save: jest.fn().mockResolvedValue({ _id: 'mock-id', ...details }),
    })),

    // Query methods
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    
    // Chainable methods
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    
    // Helper to create exec chain
    mockExec,
  };
};

/**
 * Creates a Mongoose model function (constructor) for injection
 */
export const createModelConstructor = (mockModel: any) => {
  const ModelFunc: any = function (details: any) {
    return mockModel.asConstructor(details);
  };
  
  // Add static methods
  Object.assign(ModelFunc, {
    findById: mockModel.findById,
    findByIdAndUpdate: mockModel.findByIdAndUpdate,
    findByIdAndDelete: mockModel.findByIdAndDelete,
    findOne: mockModel.findOne,
    find: mockModel.find,
  });
  
  return ModelFunc;
};

/**
 * Mock user object for testing authentication
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  role: 'Customer',
  ...overrides,
});

/**
 * Mock admin user
 */
export const createMockAdmin = (overrides = {}) => ({
  id: 'admin-123',
  email: 'admin@example.com',
  role: 'Admin',
  ...overrides,
});

/**
 * Creates a mock exec chain result
 */
export const mockExec = <T>(result: T) => ({
  exec: jest.fn().mockResolvedValue(result),
});

/**
 * Creates a mock populate chain
 */
export const mockPopulateChain = <T>(result: T) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(result),
});

/**
 * Mock menu item
 */
export const createMockMenuItem = (overrides = {}) => ({
  _id: 'item-123',
  name: 'Test Item',
  price: 10.99,
  category: 'Main Course',
  available: true,
  ...overrides,
});

/**
 * Mock order
 */
export const createMockOrder = (overrides = {}) => ({
  _id: 'order-123',
  customer: 'customer-123',
  items: [
    {
      menuItem: 'item-123',
      name: 'Test Item',
      quantity: 2,
      price: 10.99,
      subTotal: 21.98,
    },
  ],
  totalAmount: 21.98,
  status: 'Pending',
  orderType: 'Takeaway',
  ...overrides,
});

/**
 * Mock reservation
 */
export const createMockReservation = (overrides = {}) => ({
  _id: 'reservation-123',
  customer: 'customer-123',
  table: 'table-123',
  reservationDate: new Date('2025-12-15'),
  reservationTime: '18:00',
  duration: 60,
  numberOfGuests: 4,
  bookingStatus: 'pending',
  ...overrides,
});

/**
 * Mock table
 */
export const createMockTable = (overrides = {}) => ({
  _id: 'table-123',
  tableNumber: 1,
  capacity: 4,
  location: 'Main Hall',
  ...overrides,
});

/**
 * Mock feedback
 */
export const createMockFeedback = (overrides = {}) => ({
  _id: 'feedback-123',
  customer: 'customer-123',
  referenceId: 'order-123',
  rating: 5,
  comments: 'Excellent service!',
  ...overrides,
});
