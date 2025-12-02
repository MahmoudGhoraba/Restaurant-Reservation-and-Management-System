import { OrderService } from '../../src/Application/Services/order.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { createMockModel, createModelConstructor, mockPopulateChain } from '../utils/mocks';

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderModel: any;
  let mockReservationModel: any;
  let mockTableModel: any;

  beforeEach(() => {
    mockOrderModel = createMockModel();
    mockReservationModel = createMockModel();
    mockTableModel = createMockModel();

    service = new OrderService(
      createModelConstructor(mockOrderModel),
      mockReservationModel,
      mockTableModel,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create takeaway order successfully', async () => {
      const input = {
        customer: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 2, price: 10 }],
        orderType: 'Takeaway' as const,
      };

      mockOrderModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue({ _id: 'order-123', ...details }),
      }));

      const result = await service.createOrder(input);

      expect(result.totalAmount).toBe(20);
      expect(result.items[0].subTotal).toBe(20);
      expect(result.orderType).toBe('Takeaway');
    });

    it('should calculate total amount correctly for multiple items', async () => {
      const input = {
        customer: 'customer-123',
        items: [
          { menuItem: 'item-1', name: 'Pizza', quantity: 2, price: 10 },
          { menuItem: 'item-2', name: 'Salad', quantity: 1, price: 5 },
          { menuItem: 'item-3', name: 'Drink', quantity: 3, price: 2 },
        ],
        orderType: 'Takeaway' as const,
      };

      mockOrderModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      const result = await service.createOrder(input);

      expect(result.totalAmount).toBe(31); // (2*10) + (1*5) + (3*2)
    });

    it('should create dine-in order with reservation', async () => {
      const input = {
        customer: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
        orderType: 'DineIn' as const,
        reservation: 'reservation-123',
      };

      const mockReservation = {
        _id: 'reservation-123',
        table: 'table-123',
      };

      mockReservationModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockReservation),
      });

      mockOrderModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue({ _id: 'order-123', ...details }),
      }));

      const result = await service.createOrder(input);

      expect(mockReservationModel.findById).toHaveBeenCalledWith('reservation-123');
      expect(result.reservation).toBe('reservation-123');
      expect(result.table).toBe('table-123');
    });

    it('should throw NotFoundException when reservation not found', async () => {
      const input = {
        customer: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
        orderType: 'DineIn' as const,
        reservation: 'nonexistent',
      };

      mockReservationModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(service.createOrder(input)).rejects.toThrow(NotFoundException);
      await expect(service.createOrder(input)).rejects.toThrow('Reservation not found');
    });

    it('should create dine-in order with table', async () => {
      const input = {
        customer: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
        orderType: 'DineIn' as const,
        table: 'table-123',
      };

      mockTableModel.findById.mockResolvedValue({ _id: 'table-123' });
      mockOrderModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      const result = await service.createOrder(input);

      expect(mockTableModel.findById).toHaveBeenCalledWith('table-123');
      expect(result.table).toBeDefined();
    });

    it('should throw NotFoundException when table not found', async () => {
      const input = {
        customer: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
        orderType: 'DineIn' as const,
        table: 'nonexistent',
      };

      mockTableModel.findById.mockResolvedValue(null);

      await expect(service.createOrder(input)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for dine-in without reservation or table', async () => {
      const input = {
        customer: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
        orderType: 'DineIn' as const,
      };

      mockOrderModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      await expect(service.createOrder(input)).rejects.toThrow(BadRequestException);
      await expect(service.createOrder(input)).rejects.toThrow('Dine-in orders require reservation or table');
    });

    it('should handle delivery orders', async () => {
      const input = {
        customer: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
        orderType: 'Delivery' as const,
      };

      mockOrderModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      const result = await service.createOrder(input);

      expect(result.orderType).toBe('Delivery');
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders with populated fields', async () => {
      const mockOrders = [
        { _id: 'order-1', customer: { name: 'John' } },
        { _id: 'order-2', customer: { name: 'Jane' } },
      ];

      mockOrderModel.find.mockReturnValue(mockPopulateChain(mockOrders));

      const result = await service.getAllOrders();

      expect(mockOrderModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });

    it('should return empty array when no orders', async () => {
      mockOrderModel.find.mockReturnValue(mockPopulateChain([]));

      const result = await service.getAllOrders();

      expect(result).toEqual([]);
    });
  });

  describe('getOrderById', () => {
    it('should return order with populated fields', async () => {
      const mockOrder = { _id: 'order-123', customer: { name: 'John' } };
      mockOrderModel.findById.mockReturnValue(mockPopulateChain(mockOrder));

      const result = await service.getOrderById('order-123');

      expect(mockOrderModel.findById).toHaveBeenCalledWith('order-123');
      expect(result).toEqual(mockOrder);
    });

    it('should return null when not found', async () => {
      mockOrderModel.findById.mockReturnValue(mockPopulateChain(null));

      const result = await service.getOrderById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status to Preparing', async () => {
      const mockOrder = { _id: 'order-123', status: 'Preparing' };
      mockOrderModel.findByIdAndUpdate.mockReturnValue(mockPopulateChain(mockOrder));

      const result = await service.updateOrderStatus('order-123', 'Preparing');

      expect(mockOrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'order-123',
        { status: 'Preparing' },
        { new: true }
      );
      expect(result).toEqual(mockOrder);
    });

    it('should handle all status transitions', async () => {
      const statuses: Array<'Pending' | 'Preparing' | 'Served' | 'Completed'> = ['Pending', 'Preparing', 'Served', 'Completed'];

      for (const status of statuses) {
        mockOrderModel.findByIdAndUpdate.mockReturnValue(mockPopulateChain({ status }));

        const result = await service.updateOrderStatus('order-123', status);

        expect(result?.status).toBe(status);
      }
    });

    it('should return null when order not found', async () => {
      mockOrderModel.findByIdAndUpdate.mockReturnValue(mockPopulateChain(null));

      const result = await service.updateOrderStatus('nonexistent', 'Preparing');

      expect(result).toBeNull();
    });
  });

  describe('deleteOrder', () => {
    it('should delete and return the order', async () => {
      const mockOrder = { _id: 'order-123' };
      mockOrderModel.findByIdAndDelete.mockReturnValue(mockPopulateChain(mockOrder));

      const result = await service.deleteOrder('order-123');

      expect(mockOrderModel.findByIdAndDelete).toHaveBeenCalledWith('order-123');
      expect(result).toEqual(mockOrder);
    });

    it('should return null when order not found', async () => {
      mockOrderModel.findByIdAndDelete.mockReturnValue(mockPopulateChain(null));

      const result = await service.deleteOrder('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('linkPayment', () => {
    it('should link payment to order', async () => {
      const mockOrder = { _id: 'order-123', payment: 'payment-123' };
      mockOrderModel.findByIdAndUpdate.mockReturnValue(mockPopulateChain(mockOrder));

      const result = await service.linkPayment('order-123', 'payment-123');

      expect(mockOrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'order-123',
        { payment: 'payment-123' },
        { new: true }
      );
      expect(result).toEqual(mockOrder);
    });

    it('should return null when order not found', async () => {
      mockOrderModel.findByIdAndUpdate.mockReturnValue(mockPopulateChain(null));

      const result = await service.linkPayment('nonexistent', 'payment-123');

      expect(result).toBeNull();
    });
  });
});
