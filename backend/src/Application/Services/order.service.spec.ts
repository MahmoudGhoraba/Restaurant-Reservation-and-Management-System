import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { Types } from 'mongoose';

describe('OrderService', () => {
  let service: OrderService;

  const menuItemId = new (require('mongoose').Types.ObjectId)().toHexString();
  const menuItem = { _id: menuItemId, name: 'Burger', price: 10, availability: true };
  const savedOrder = { _id: 'o1', totalAmount: 20 };

  const mockMenuItemModel = {
    findById: jest.fn().mockImplementation((id: string) => {
      if (id === 'missing') return Promise.resolve(null);
      return Promise.resolve(menuItem);
    }),
  };

  const mockOrderModelConstructor = jest.fn().mockImplementation((payload) => ({
    save: jest.fn().mockResolvedValue({ ...payload, _id: savedOrder._id }),
  }));

  const mockReservationModel = {
    findById: jest.fn().mockResolvedValue({ _id: 'r1', table: 't1' }),
  };

  const mockTableModel = {
    findById: jest.fn().mockResolvedValue({ _id: 't1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getModelToken('Order'), useValue: mockOrderModelConstructor },
        { provide: getModelToken('Reservation'), useValue: mockReservationModel },
        { provide: getModelToken('Table'), useValue: mockTableModel },
        { provide: getModelToken('MenuItem'), useValue: mockMenuItemModel },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => jest.clearAllMocks());

  it('creates a Takeaway order successfully', async () => {
    const result = await service.createOrder({
      customer: new Types.ObjectId().toHexString(),
      items: [{ menuItem: menuItemId, quantity: 2 }],
      orderType: 'Takeaway',
      paymentType: 'Cash',
    } as any);

    expect(result).toHaveProperty('_id', savedOrder._id);
    expect(mockMenuItemModel.findById).toHaveBeenCalledWith(menuItemId);
    expect(mockOrderModelConstructor).toHaveBeenCalled();
  });

  it('throws if menu item not found', async () => {
    await expect(
      service.createOrder({
        customer: new Types.ObjectId().toHexString(),
        items: [{ menuItem: 'missing', quantity: 1 }],
        orderType: 'Takeaway',
        paymentType: 'Card',
      } as any)
    ).rejects.toThrow();
  });

  it('creates a DineIn order with table param', async () => {
    const result = await service.createOrder({
      customer: new Types.ObjectId().toHexString(),
      items: [{ menuItem: menuItemId, quantity: 2 }],
      orderType: 'DineIn',
      paymentType: 'Cash',
      table: 't1',
    } as any);

    expect(result).toHaveProperty('_id', savedOrder._id);
    expect(mockTableModel.findById).toHaveBeenCalledWith('t1');
  });
});
