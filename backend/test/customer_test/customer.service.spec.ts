import { CustomerService } from './customer.service';
import { Types } from 'mongoose';
import { createMockModel, createModelConstructor, mockExec, mockPopulateChain } from '../utils/mocks';

describe('CustomerService', () => {
  let service: CustomerService;
  let mockMenuItemModel: any;
  let mockOrderModel: any;
  let mockFeedbackModel: any;

  beforeEach(() => {
    mockMenuItemModel = createMockModel();
    mockOrderModel = createMockModel();
    mockFeedbackModel = createMockModel();

    service = new CustomerService(
      mockMenuItemModel,
      createModelConstructor(mockOrderModel),
      createModelConstructor(mockFeedbackModel),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('browseMenu', () => {
    it('should return all menu items with populated category', async () => {
      const mockItems = [
        { _id: '1', name: 'Pizza', category: { name: 'Main' } },
        { _id: '2', name: 'Salad', category: { name: 'Appetizer' } },
      ];

      mockMenuItemModel.find.mockReturnValue(mockPopulateChain(mockItems));

      const result = await service.browseMenu();

      expect(mockMenuItemModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockItems);
    });

    it('should return empty array when no items', async () => {
      mockMenuItemModel.find.mockReturnValue(mockPopulateChain([]));

      const result = await service.browseMenu();

      expect(result).toEqual([]);
    });
  });

  describe('placeOrder', () => {
    it('should create order with correct total amount', async () => {
      const customerId = '507f1f77bcf86cd799439011';
      const items = [
        { menuItem: '507f1f77bcf86cd799439012', name: 'Pizza', quantity: 2, price: 10 },
        { menuItem: '507f1f77bcf86cd799439013', name: 'Salad', quantity: 1, price: 5 },
      ];

      mockOrderModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue({ _id: 'order-123', ...details }),
      }));

      const result = await service.placeOrder(customerId, items);

      expect(mockOrderModel.asConstructor).toHaveBeenCalled();
      const orderDetails = mockOrderModel.asConstructor.mock.calls[0][0];
      expect(orderDetails.totalAmount).toBe(25); // (2*10) + (1*5)
      expect(orderDetails.items).toHaveLength(2);
      expect(result).toHaveProperty('_id', 'order-123');
    });

    it('should calculate subtotal for each item correctly', async () => {
      const items = [{ menuItem: '507f1f77bcf86cd799439012', name: 'Pizza', quantity: 3, price: 15 }];

      mockOrderModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      await service.placeOrder('507f1f77bcf86cd799439011', items);

      const orderDetails = mockOrderModel.asConstructor.mock.calls[0][0];
      expect(orderDetails.items[0].subTotal).toBe(45);
    });

    it('should include paymentId when provided', async () => {
      const items = [{ menuItem: '507f1f77bcf86cd799439012', name: 'Pizza', quantity: 1, price: 10 }];
      const paymentId = '507f1f77bcf86cd799439014';

      mockOrderModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      await service.placeOrder('507f1f77bcf86cd799439011', items, paymentId);

      const orderDetails = mockOrderModel.asConstructor.mock.calls[0][0];
      expect(orderDetails.payment).toBeDefined();
    });

    it('should handle empty items array', async () => {
      mockOrderModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      await service.placeOrder('507f1f77bcf86cd799439011', []);

      const orderDetails = mockOrderModel.asConstructor.mock.calls[0][0];
      expect(orderDetails.totalAmount).toBe(0);
      expect(orderDetails.items).toEqual([]);
    });
  });

  describe('trackOrder', () => {
    it('should return order with populated fields', async () => {
      const mockOrder = {
        _id: 'order-123',
        items: [{ menuItem: { name: 'Pizza', price: 10 } }],
        customer: { name: 'John' },
      };

      mockOrderModel.findById.mockReturnValue(mockPopulateChain(mockOrder));

      const result = await service.trackOrder('order-123');

      expect(mockOrderModel.findById).toHaveBeenCalledWith('order-123');
      expect(result).toEqual(mockOrder);
    });

    it('should return null when order not found', async () => {
      mockOrderModel.findById.mockReturnValue(mockPopulateChain(null));

      const result = await service.trackOrder('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('giveFeedback', () => {
    it('should create feedback with all fields', async () => {
      const customerId = '507f1f77bcf86cd799439011';
      const referenceId = '507f1f77bcf86cd799439012';
      const rating = 5;
      const comment = 'Excellent!';

      mockFeedbackModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue({ _id: 'feedback-123', ...details }),
      }));

      const result = await service.giveFeedback(customerId, referenceId, rating, comment);

      expect(mockFeedbackModel.asConstructor).toHaveBeenCalled();
      const feedbackDetails = mockFeedbackModel.asConstructor.mock.calls[0][0];
      expect(feedbackDetails.rating).toBe(5);
      expect(feedbackDetails.comments).toBe('Excellent!');
      expect(result).toHaveProperty('_id', 'feedback-123');
    });

    it('should handle minimum rating (1)', async () => {
      mockFeedbackModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      await service.giveFeedback('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', 1, 'Bad');

      const feedbackDetails = mockFeedbackModel.asConstructor.mock.calls[0][0];
      expect(feedbackDetails.rating).toBe(1);
    });

    it('should handle maximum rating (5)', async () => {
      mockFeedbackModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      await service.giveFeedback('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', 5, 'Perfect!');

      const feedbackDetails = mockFeedbackModel.asConstructor.mock.calls[0][0];
      expect(feedbackDetails.rating).toBe(5);
    });

    it('should handle empty comment', async () => {
      mockFeedbackModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      await service.giveFeedback('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', 4, '');

      const feedbackDetails = mockFeedbackModel.asConstructor.mock.calls[0][0];
      expect(feedbackDetails.comments).toBe('');
    });
  });
});
