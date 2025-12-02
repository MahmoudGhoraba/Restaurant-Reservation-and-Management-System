import { OrderController } from '../../src/Application/Controllers/order.controller';
import { OrderService } from '../../src/Application/Services/order.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createMockOrder } from '../utils/mocks';

describe('OrderController', () => {
  let controller: OrderController;
  let service: Partial<Record<keyof OrderService, jest.Mock>>;

  beforeEach(() => {
    service = {
      createOrder: jest.fn(),
      getAllOrders: jest.fn(),
      getOrderById: jest.fn(),
      updateOrderStatus: jest.fn(),
      deleteOrder: jest.fn(),
      linkPayment: jest.fn(),
    } as any;

    controller = new OrderController(service as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should throw BadRequestException when items missing', async () => {
      const dto = { id: 'customer-123' } as any;

      await expect(controller.createOrder(dto)).rejects.toThrow(BadRequestException);
      await expect(controller.createOrder(dto)).rejects.toThrow('Order must contain at least one item');
    });

    it('should throw BadRequestException when items empty', async () => {
      const dto = { id: 'customer-123', items: [] } as any;

      await expect(controller.createOrder(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when id missing', async () => {
      const dto = { items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }] } as any;

      await expect(controller.createOrder(dto)).rejects.toThrow(BadRequestException);
      await expect(controller.createOrder(dto)).rejects.toThrow('User not authenticated');
    });

    it('should throw BadRequestException for dine-in without reservation or table', async () => {
      const dto = {
        id: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
        orderType: 'DineIn',
      } as any;

      await expect(controller.createOrder(dto)).rejects.toThrow(BadRequestException);
      await expect(controller.createOrder(dto)).rejects.toThrow('For dine-in orders provide reservation id or table id');
    });

    it('should create takeaway order successfully', async () => {
      const dto = {
        id: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
        orderType: 'Takeaway',
      } as any;

      const mockOrder = createMockOrder();
      (service.createOrder as jest.Mock).mockResolvedValue(mockOrder);

      const result = await controller.createOrder(dto);

      expect(service.createOrder).toHaveBeenCalledWith({
        customer: 'customer-123',
        items: dto.items,
        payment: null,
        orderType: 'Takeaway',
        reservation: null,
        table: null,
      });
      expect(result).toHaveProperty('status', 'success');
      expect(result.data).toEqual(mockOrder);
    });

    it('should create dine-in order with reservation', async () => {
      const dto = {
        id: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
        orderType: 'DineIn',
        reservation: 'reservation-123',
      } as any;

      (service.createOrder as jest.Mock).mockResolvedValue(createMockOrder());

      await controller.createOrder(dto);

      expect(service.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          orderType: 'DineIn',
          reservation: 'reservation-123',
        })
      );
    });

    it('should default to Takeaway when orderType not specified', async () => {
      const dto = {
        id: 'customer-123',
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
      } as any;

      (service.createOrder as jest.Mock).mockResolvedValue(createMockOrder());

      await controller.createOrder(dto);

      expect(service.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ orderType: 'Takeaway' })
      );
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders with results count', async () => {
      const mockOrders = [createMockOrder(), createMockOrder({ _id: 'order-2' })];
      (service.getAllOrders as jest.Mock).mockResolvedValue(mockOrders);

      const result = await controller.getAllOrders();

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('results', 2);
      expect(result.data).toEqual(mockOrders);
    });

    it('should return empty array when no orders', async () => {
      (service.getAllOrders as jest.Mock).mockResolvedValue([]);

      const result = await controller.getAllOrders();

      expect(result.results).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const mockOrder = createMockOrder();
      (service.getOrderById as jest.Mock).mockResolvedValue(mockOrder);

      const result = await controller.getOrderById('order-123');

      expect(service.getOrderById).toHaveBeenCalledWith('order-123');
      expect(result).toHaveProperty('status', 'success');
      expect(result.data).toEqual(mockOrder);
    });

    it('should throw NotFoundException when not found', async () => {
      (service.getOrderById as jest.Mock).mockResolvedValue(null);

      await expect(controller.getOrderById('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(controller.getOrderById('nonexistent')).rejects.toThrow('Order not found');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const mockOrder = createMockOrder({ status: 'Preparing' });
      (service.updateOrderStatus as jest.Mock).mockResolvedValue(mockOrder);

      const result = await controller.updateOrderStatus('order-123', { status: 'Preparing' } as any);

      expect(service.updateOrderStatus).toHaveBeenCalledWith('order-123', 'Preparing');
      expect(result).toHaveProperty('status', 'success');
      expect(result.data.status).toBe('Preparing');
    });

    it('should throw NotFoundException when order not found', async () => {
      (service.updateOrderStatus as jest.Mock).mockResolvedValue(null);

      await expect(controller.updateOrderStatus('nonexistent', { status: 'Preparing' } as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      (service.deleteOrder as jest.Mock).mockResolvedValue(createMockOrder());

      const result = await controller.deleteOrder('order-123');

      expect(service.deleteOrder).toHaveBeenCalledWith('order-123');
      expect(result).toHaveProperty('status', 'success');
      expect(result.data).toBeNull();
    });

    it('should throw NotFoundException when order not found', async () => {
      (service.deleteOrder as jest.Mock).mockResolvedValue(null);

      await expect(controller.deleteOrder('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('linkPayment', () => {
    it('should link payment to order', async () => {
      const mockOrder = createMockOrder({ payment: 'payment-123' } as any);
      (service.linkPayment as jest.Mock).mockResolvedValue(mockOrder);

      const result = await controller.linkPayment('order-123', { paymentId: 'payment-123' } as any);

      expect(service.linkPayment).toHaveBeenCalledWith('order-123', 'payment-123');
      expect(result).toHaveProperty('status', 'success');
    });

    it('should throw NotFoundException when order not found', async () => {
      (service.linkPayment as jest.Mock).mockResolvedValue(null);

      await expect(controller.linkPayment('nonexistent', { paymentId: 'payment-123' } as any))
        .rejects.toThrow(NotFoundException);
    });
  });
});
