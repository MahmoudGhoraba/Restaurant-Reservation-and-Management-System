import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReservationService } from './reservation.service';
import { TableService } from '../Services/table.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReservationService (thorough)', () => {
  let service: ReservationService;

  const mockTableService = {
    getTable: jest.fn(),
    checkTableAvailability: jest.fn(),
  };

  // A flexible mock for the Mongoose model. It's a callable constructor with static methods.
  const mockReservationModel: any = jest.fn();
  mockReservationModel.create = jest.fn();
  mockReservationModel.find = jest.fn();
  mockReservationModel.findById = jest.fn();
  mockReservationModel.findOne = jest.fn();
  mockReservationModel.findByIdAndDelete = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: getModelToken('Reservation'), useValue: mockReservationModel },
        { provide: TableService, useValue: mockTableService },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  it('creates a reservation successfully when table exists, capacity ok, and available', async () => {
    mockTableService.getTable.mockResolvedValue({ _id: 't1', capacity: 4 });
    mockTableService.checkTableAvailability.mockResolvedValue(true);

    const saved = { _id: 'res1', customer: 'c1', table: 't1' };
    // simulate constructor + save: when used with `new`, return object with save()
    mockReservationModel.mockImplementationOnce((payload) => ({ save: jest.fn().mockResolvedValue(saved) }));

    const res = await service.createReservation({
      customer: 'c1',
      table: 't1',
      reservationDate: new Date('2025-12-20'),
      reservationTime: '18:00',
      numberOfGuests: 2,
    } as any);

    expect(res).toEqual(saved);
    expect(mockTableService.getTable).toHaveBeenCalledWith('t1');
    expect(mockTableService.checkTableAvailability).toHaveBeenCalled();
  });

  it('throws NotFoundException when table does not exist', async () => {
    mockTableService.getTable.mockResolvedValue(null);

    await expect(
      service.createReservation({
        customer: 'c1',
        table: 'missing',
        reservationDate: new Date(),
        reservationTime: '18:00',
        numberOfGuests: 2,
      } as any)
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when numberOfGuests exceeds table capacity', async () => {
    mockTableService.getTable.mockResolvedValue({ _id: 't1', capacity: 2 });

    await expect(
      service.createReservation({
        customer: 'c1',
        table: 't1',
        reservationDate: new Date(),
        reservationTime: '18:00',
        numberOfGuests: 4,
      } as any)
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when table is not available', async () => {
    mockTableService.getTable.mockResolvedValue({ _id: 't1', capacity: 6 });
    mockTableService.checkTableAvailability.mockResolvedValue(false);

    await expect(
      service.createReservation({
        customer: 'c1',
        table: 't1',
        reservationDate: new Date(),
        reservationTime: '18:00',
        numberOfGuests: 2,
      } as any)
    ).rejects.toThrow(BadRequestException);
  });

  it('getAllReservations returns populated sorted list', async () => {
    const mockExec = jest.fn().mockResolvedValue([{ _id: 'r1' }, { _id: 'r2' }]);
    const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), exec: mockExec };
    mockReservationModel.find.mockReturnValue(chain);

    const res = await service.getAllReservations();
    expect(mockReservationModel.find).toHaveBeenCalled();
    expect(res).toEqual([{ _id: 'r1' }, { _id: 'r2' }]);
  });

  it('getReservationById returns populated reservation or null', async () => {
    const mockExec = jest.fn().mockResolvedValue({ _id: 'r1' });
    const chain = { populate: jest.fn().mockReturnThis(), exec: mockExec };
    mockReservationModel.findById.mockReturnValue(chain);

    const res = await service.getReservationById('r1');
    expect(mockReservationModel.findById).toHaveBeenCalledWith('r1');
    expect(res).toEqual({ _id: 'r1' });
  });

  it('getReservationsByCustomer queries by customer and returns list', async () => {
    const mockExec = jest.fn().mockResolvedValue([{ _id: 'r1' }]);
    const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), exec: mockExec };
    mockReservationModel.find.mockReturnValue(chain);

    const res = await service.getReservationsByCustomer('c1');
    expect(mockReservationModel.find).toHaveBeenCalledWith({ customer: 'c1' });
    expect(res).toEqual([{ _id: 'r1' }]);
  });

  it('updateReservation returns null when not found', async () => {
    mockReservationModel.findOne.mockResolvedValue(null);
    const res = await service.updateReservation('missing', 'c1', {} as any);
    expect(res).toBeNull();
  });

  it('updateReservation throws when new table not found', async () => {
    const mockReservation = { table: 't1', numberOfGuests: 2, save: jest.fn().mockResolvedValue(true) };
    mockReservationModel.findOne.mockResolvedValue(mockReservation);
    mockTableService.getTable.mockResolvedValue(null);

    await expect(service.updateReservation('r1', 'c1', { table: 't2' } as any)).rejects.toThrow(NotFoundException);
  });

  it('updateReservation throws when capacity insufficient', async () => {
    const mockReservation = { table: 't1', numberOfGuests: 2, save: jest.fn().mockResolvedValue(true) };
    mockReservationModel.findOne.mockResolvedValue(mockReservation);
    mockTableService.getTable.mockResolvedValue({ _id: 't2', capacity: 1 });

    await expect(service.updateReservation('r1', 'c1', { table: 't2', numberOfGuests: 3 } as any)).rejects.toThrow(BadRequestException);
  });

  it('updateReservation throws when updated slot not available', async () => {
    const mockReservation = { table: 't1', numberOfGuests: 2, reservationDate: new Date(), reservationTime: '18:00', duration: 60, save: jest.fn().mockResolvedValue(true) };
    mockReservationModel.findOne.mockResolvedValue(mockReservation);
    mockTableService.getTable.mockResolvedValue({ _id: 't1', capacity: 4 });
    mockTableService.checkTableAvailability.mockResolvedValue(false);

    await expect(service.updateReservation('r1', 'c1', { reservationTime: '19:00' } as any)).rejects.toThrow(BadRequestException);
  });

  it('cancelReservationByCustomer returns null when not found', async () => {
    mockReservationModel.findOne.mockResolvedValue(null);
    const res = await service.cancelReservationByCustomer('r1', 'c1');
    expect(res).toBeNull();
  });

  it('cancelReservationByCustomer sets bookingStatus to canceled', async () => {
    const mockReservation = { bookingStatus: 'pending', save: jest.fn().mockResolvedValue({ bookingStatus: 'canceled' }) };
    mockReservationModel.findOne.mockResolvedValue(mockReservation);

    const res = await service.cancelReservationByCustomer('r1', 'c1');
    expect(mockReservation.save).toHaveBeenCalled();
    expect(res.bookingStatus).toBe('canceled');
  });

  it('confirmReservation throws when reservation is canceled', async () => {
    const mockReservation = { bookingStatus: 'canceled', save: jest.fn() };
    mockReservationModel.findById.mockResolvedValue(mockReservation);

    await expect(service.confirmReservation('r1')).rejects.toThrow(BadRequestException);
  });

  it('confirmReservation sets bookingStatus to confirmed', async () => {
    const mockReservation = { bookingStatus: 'pending', save: jest.fn().mockResolvedValue({ bookingStatus: 'confirmed' }) };
    mockReservationModel.findById.mockResolvedValue(mockReservation);

    const res = await service.confirmReservation('r1');
    expect(mockReservation.save).toHaveBeenCalled();
    expect(res.bookingStatus).toBe('confirmed');
  });

  it('deleteReservation calls findByIdAndDelete', async () => {
    mockReservationModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'r1' }) });
    const res = await service.deleteReservation('r1');
    expect(mockReservationModel.findByIdAndDelete).toHaveBeenCalledWith('r1');
    expect(res).toEqual({ _id: 'r1' });
  });

  it('getTableReservations queries the day range', async () => {
    const mockExec = jest.fn().mockResolvedValue([{ _id: 'r1' }]);
    const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), exec: mockExec };
    mockReservationModel.find.mockReturnValue(chain);

    const date = new Date('2025-12-20');
    const res = await service.getTableReservations('t1', date);
    expect(mockReservationModel.find).toHaveBeenCalled();
    expect(res).toEqual([{ _id: 'r1' }]);
  });
});
