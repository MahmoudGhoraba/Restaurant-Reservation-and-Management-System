import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('CustomerService', () => {
  let service: CustomerService;

  const mockMenuItemModel = {
    find: jest.fn(),
    findById: jest.fn(),
  };

  const mockOrderModel: any = jest.fn();
  mockOrderModel.findById = jest.fn();
  mockOrderModel.find = jest.fn();

  const mockFeedbackModel: any = jest.fn();
  mockFeedbackModel.create = jest.fn();

  const mockReservationModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: getModelToken('MenuItem'), useValue: mockMenuItemModel },
        { provide: getModelToken('Order'), useValue: mockOrderModel },
        { provide: getModelToken('Feedback'), useValue: mockFeedbackModel },
        { provide: getModelToken('Reservation'), useValue: mockReservationModel },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  describe('browseMenu', () => {
    it('should return all available menu items', async () => {
      const mockMenuItems = [
        { _id: '1', name: 'Burger', price: 10, availability: true },
        { _id: '2', name: 'Pizza', price: 15, availability: true },
      ];

      mockMenuItemModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMenuItems),
      });

      const result = await service.browseMenu();

      expect(result).toEqual(mockMenuItems);
      expect(mockMenuItemModel.find).toHaveBeenCalledWith({ availability: true });
    });
  });

  describe('placeOrder', () => {
    it('should successfully place a Takeaway order', async () => {
      const customerId = new Types.ObjectId().toHexString();
      const menuItemId = new Types.ObjectId().toHexString();

      const mockMenuItem = {
        _id: menuItemId,
        name: 'Burger',
        price: 10,
        availability: true,
      };

      const orderData = {
        items: [{ menuItem: menuItemId, quantity: 2 }],
        orderType: 'Takeaway' as const,
        paymentType: 'Cash' as const,
      };

      mockMenuItemModel.findById.mockResolvedValue(mockMenuItem);

      const savedOrder = {
        _id: 'order-id',
        customer: customerId,
        items: [{
          menuItem: new Types.ObjectId(menuItemId),
          quantity: 2,
          subTotal: 20,
        }],
        totalAmount: 20,
        orderType: 'Takeaway',
        paymentType: 'Cash',
      };

      mockOrderModel.mockImplementation((payload) => ({
        save: jest.fn().mockResolvedValue({ ...payload, ...savedOrder }),
      }));

      const result = await service.placeOrder(customerId, orderData);

      expect(result).toBeDefined();
      expect(mockMenuItemModel.findById).toHaveBeenCalledWith(menuItemId);
    });

    it('should throw BadRequestException if DineIn order without reservation', async () => {
      const customerId = new Types.ObjectId().toHexString();
      const menuItemId = new Types.ObjectId().toHexString();

      const orderData = {
        items: [{ menuItem: menuItemId, quantity: 1 }],
        orderType: 'DineIn' as const,
        paymentType: 'Cash' as const,
      };

      await expect(service.placeOrder(customerId, orderData)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if menu item not found', async () => {
      const customerId = new Types.ObjectId().toHexString();
      const menuItemId = new Types.ObjectId().toHexString();

      const orderData = {
        items: [{ menuItem: menuItemId, quantity: 1 }],
        orderType: 'Takeaway' as const,
        paymentType: 'Cash' as const,
      };

      mockMenuItemModel.findById.mockResolvedValue(null);

      await expect(service.placeOrder(customerId, orderData)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if menu item is unavailable', async () => {
      const customerId = new Types.ObjectId().toHexString();
      const menuItemId = new Types.ObjectId().toHexString();

      const mockMenuItem = {
        _id: menuItemId,
        name: 'Burger',
        price: 10,
        availability: false,
      };

      const orderData = {
        items: [{ menuItem: menuItemId, quantity: 1 }],
        orderType: 'Takeaway' as const,
        paymentType: 'Cash' as const,
      };

      mockMenuItemModel.findById.mockResolvedValue(mockMenuItem);

      await expect(service.placeOrder(customerId, orderData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrdersByCustomer', () => {
    it('should return orders for a customer', async () => {
      const customerId = new Types.ObjectId().toHexString();
      const mockOrders = [
        { _id: 'order1', customer: customerId, totalAmount: 20 },
        { _id: 'order2', customer: customerId, totalAmount: 30 },
      ];

      mockOrderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrders),
      });

      const result = await service.getOrdersByCustomer(customerId);

      expect(result).toEqual(mockOrders);
      expect(mockOrderModel.find).toHaveBeenCalledWith({ 
        customer: expect.any(Types.ObjectId) 
      });
    });
  });

  describe('trackOrder', () => {
    it('should return order details by ID', async () => {
      const orderId = new Types.ObjectId().toHexString();
      const mockOrder = {
        _id: orderId,
        customer: 'customer-id',
        totalAmount: 50,
        orderStatus: 'Pending',
      };

      mockOrderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.trackOrder(orderId);

      expect(result).toEqual(mockOrder);
      expect(mockOrderModel.findById).toHaveBeenCalledWith(orderId);
    });
  });

  describe('giveFeedback', () => {
    it('should successfully submit feedback', async () => {
      const customerId = new Types.ObjectId().toHexString();
      const referenceId = new Types.ObjectId().toHexString();

      const mockFeedback = {
        _id: 'feedback-id',
        customer: customerId,
        referenceId: referenceId,
        rating: 5,
        comments: 'Great service!',
        save: jest.fn().mockResolvedValue({
          _id: 'feedback-id',
          customer: customerId,
          referenceId: referenceId,
          rating: 5,
          comments: 'Great service!',
        }),
      };

      mockFeedbackModel.mockImplementation(() => mockFeedback);

      const result = await service.giveFeedback(customerId, referenceId, 5, 'Great service!');

      expect(result).toBeDefined();
      expect(mockFeedback.save).toHaveBeenCalled();
    });
  });
});
