import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { NotFoundException } from '@nestjs/common';
import { createMockUser, createMockMenuItem, createMockOrder } from '../../test/utils/mocks';

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: Partial<Record<keyof CustomerService, jest.Mock>>;

  beforeEach(() => {
    service = {
      browseMenu: jest.fn(),
      placeOrder: jest.fn(),
      trackOrder: jest.fn(),
      giveFeedback: jest.fn(),
    } as any;

    controller = new CustomerController(service as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('browseMenu', () => {
    it('should return menu with results count', async () => {
      const mockMenu = [createMockMenuItem({ name: 'Pizza' }), createMockMenuItem({ name: 'Pasta' })];
      (service.browseMenu as jest.Mock).mockResolvedValue(mockMenu);

      const result = await controller.browseMenu();

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('results', 2);
      expect(result.data).toEqual(mockMenu);
    });

    it('should return empty menu', async () => {
      (service.browseMenu as jest.Mock).mockResolvedValue([]);

      const result = await controller.browseMenu();

      expect(result.results).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  describe('placeOrder', () => {
    it('should create order with user id', async () => {
      const user = createMockUser();
      const dto = { items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }] } as any;
      const mockOrder = createMockOrder();

      (service.placeOrder as jest.Mock).mockResolvedValue(mockOrder);

      const result = await controller.placeOrder(dto, user);

      expect(service.placeOrder).toHaveBeenCalledWith(user.id, dto.items, undefined);
      expect(result).toHaveProperty('status', 'success');
      expect(result.data).toEqual(mockOrder);
    });

    it('should include paymentId when provided', async () => {
      const user = createMockUser();
      const dto = { 
        items: [{ menuItem: 'item-1', name: 'Pizza', quantity: 1, price: 10 }],
        paymentId: 'payment-123'
      } as any;

      (service.placeOrder as jest.Mock).mockResolvedValue(createMockOrder());

      await controller.placeOrder(dto, user);

      expect(service.placeOrder).toHaveBeenCalledWith(user.id, dto.items, 'payment-123');
    });
  });

  describe('trackOrder', () => {
    it('should return order when found', async () => {
      const mockOrder = createMockOrder();
      (service.trackOrder as jest.Mock).mockResolvedValue(mockOrder);

      const result = await controller.trackOrder('order-123');

      expect(service.trackOrder).toHaveBeenCalledWith('order-123');
      expect(result).toHaveProperty('status', 'success');
      expect(result.data).toEqual(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      (service.trackOrder as jest.Mock).mockResolvedValue(null);

      await expect(controller.trackOrder('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(controller.trackOrder('nonexistent')).rejects.toThrow('Order not found');
    });
  });

  describe('giveFeedback', () => {
    it('should create feedback with user id', async () => {
      const user = createMockUser();
      const dto = { referenceId: 'order-123', rating: 5, comment: 'Great!' } as any;
      const mockFeedback = { _id: 'feedback-123', ...dto };

      (service.giveFeedback as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await controller.giveFeedback(dto, user);

      expect(service.giveFeedback).toHaveBeenCalledWith(user.id, dto.referenceId, dto.rating, dto.comment);
      expect(result).toHaveProperty('status', 'success');
      expect(result.data).toEqual(mockFeedback);
    });

    it('should handle different ratings', async () => {
      const user = createMockUser();
      
      for (let rating = 1; rating <= 5; rating++) {
        const dto = { referenceId: 'order-123', rating, comment: 'Test' } as any;
        (service.giveFeedback as jest.Mock).mockResolvedValue({ _id: 'fb', rating });

        await controller.giveFeedback(dto, user);

        expect(service.giveFeedback).toHaveBeenCalledWith(user.id, dto.referenceId, rating, dto.comment);
      }
    });
  });
});
