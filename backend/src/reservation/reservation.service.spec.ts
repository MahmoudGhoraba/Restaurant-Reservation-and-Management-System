import { ReservationService } from './reservation.service';
import { TableService } from '../table/table.service';
import { BadRequestException } from '@nestjs/common';
import { createMockModel, createModelConstructor, mockPopulateChain, createMockReservation } from '../../test/utils/mocks';

describe('ReservationService', () => {
  let service: ReservationService;
  let mockReservationModel: any;
  let mockTableService: Partial<TableService>;

  beforeEach(() => {
    mockReservationModel = createMockModel();
    mockTableService = {
      checkTableAvailability: jest.fn(),
    };

    service = new ReservationService(
      createModelConstructor(mockReservationModel),
      mockTableService as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReservation', () => {
    it('should create reservation when table is available', async () => {
      const input = {
        customer: 'customer-123',
        table: 'table-123',
        reservationDate: new Date('2025-12-15'),
        reservationTime: '18:00',
        numberOfGuests: 4,
        duration: 60,
      };

      (mockTableService.checkTableAvailability as jest.Mock).mockResolvedValue(true);
      mockReservationModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue({ _id: 'reservation-123', ...details }),
      }));

      const result = await service.createReservation(input);

      expect(mockTableService.checkTableAvailability).toHaveBeenCalledWith('table-123', input.reservationDate, '18:00', 60);
      expect(result).toHaveProperty('_id', 'reservation-123');
    });

    it('should throw BadRequestException when table not available', async () => {
      const input = {
        customer: 'customer-123',
        table: 'table-123',
        reservationDate: new Date('2025-12-15'),
        reservationTime: '18:00',
        numberOfGuests: 4,
      };

      (mockTableService.checkTableAvailability as jest.Mock).mockResolvedValue(false);

      await expect(service.createReservation(input)).rejects.toThrow(BadRequestException);
      await expect(service.createReservation(input)).rejects.toThrow('Table is not available');
    });

    it('should use default duration of 60 minutes', async () => {
      const input = {
        customer: 'customer-123',
        table: 'table-123',
        reservationDate: new Date('2025-12-15'),
        reservationTime: '18:00',
        numberOfGuests: 4,
      };

      (mockTableService.checkTableAvailability as jest.Mock).mockResolvedValue(true);
      mockReservationModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      await service.createReservation(input);

      const reservationDetails = mockReservationModel.asConstructor.mock.calls[0][0];
      expect(reservationDetails.duration).toBe(60);
    });

    it('should handle custom duration', async () => {
      const input = {
        customer: 'customer-123',
        table: 'table-123',
        reservationDate: new Date('2025-12-15'),
        reservationTime: '18:00',
        numberOfGuests: 4,
        duration: 120,
      };

      (mockTableService.checkTableAvailability as jest.Mock).mockResolvedValue(true);
      mockReservationModel.asConstructor.mockImplementation((details: any) => ({
        save: jest.fn().mockResolvedValue(details),
      }));

      await service.createReservation(input);

      const reservationDetails = mockReservationModel.asConstructor.mock.calls[0][0];
      expect(reservationDetails.duration).toBe(120);
    });
  });

  describe('getAllReservations', () => {
    it('should return sorted reservations with populated fields', async () => {
      const mockReservations = [
        createMockReservation({ reservationDate: new Date('2025-12-15') }),
        createMockReservation({ reservationDate: new Date('2025-12-16') }),
      ];

      mockReservationModel.find.mockReturnValue(mockPopulateChain(mockReservations));

      const result = await service.getAllReservations();

      expect(mockReservationModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockReservations);
    });

    it('should return empty array when no reservations', async () => {
      mockReservationModel.find.mockReturnValue(mockPopulateChain([]));

      const result = await service.getAllReservations();

      expect(result).toEqual([]);
    });
  });

  describe('getReservationById', () => {
    it('should return reservation with populated fields', async () => {
      const mockReservation = createMockReservation();
      mockReservationModel.findById.mockReturnValue(mockPopulateChain(mockReservation));

      const result = await service.getReservationById('reservation-123');

      expect(mockReservationModel.findById).toHaveBeenCalledWith('reservation-123');
      expect(result).toEqual(mockReservation);
    });

    it('should return null when not found', async () => {
      mockReservationModel.findById.mockReturnValue(mockPopulateChain(null));

      const result = await service.getReservationById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getReservationsByCustomer', () => {
    it('should return customer reservations sorted by date', async () => {
      const mockReservations = [createMockReservation(), createMockReservation({ _id: 'reservation-2' })];
      mockReservationModel.find.mockReturnValue(mockPopulateChain(mockReservations));

      const result = await service.getReservationsByCustomer('customer-123');

      expect(mockReservationModel.find).toHaveBeenCalledWith({ customer: 'customer-123' });
      expect(result).toEqual(mockReservations);
    });

    it('should return empty array when customer has no reservations', async () => {
      mockReservationModel.find.mockReturnValue(mockPopulateChain([]));

      const result = await service.getReservationsByCustomer('customer-123');

      expect(result).toEqual([]);
    });
  });

  describe('updateReservation', () => {
    it('should update reservation fields', async () => {
      const mockReservation = {
        _id: 'reservation-123',
        customer: 'customer-123',
        table: 'table-123',
        reservationDate: new Date('2025-12-15'),
        reservationTime: '18:00',
        numberOfGuests: 4,
        duration: 60,
        save: jest.fn().mockResolvedValue({ _id: 'reservation-123', table: 'table-456' }),
      };

      mockReservationModel.findOne.mockResolvedValue(mockReservation);

      const result = await service.updateReservation('reservation-123', 'customer-123', { table: 'table-456' });

      expect(mockReservationModel.findOne).toHaveBeenCalledWith({
        _id: 'reservation-123',
        customer: 'customer-123',
      });
      expect(mockReservation.save).toHaveBeenCalled();
    });

    it('should return null when reservation not found or unauthorized', async () => {
      mockReservationModel.findOne.mockResolvedValue(null);

      const result = await service.updateReservation('reservation-123', 'wrong-customer', {});

      expect(result).toBeNull();
    });

    it('should update multiple fields', async () => {
      const mockReservation = {
        _id: 'reservation-123',
        customer: 'customer-123',
        save: jest.fn().mockResolvedValue({ _id: 'reservation-123' }),
      } as any;

      mockReservationModel.findOne.mockResolvedValue(mockReservation);

      await service.updateReservation('reservation-123', 'customer-123', {
        table: 'table-456',
        numberOfGuests: 6,
        duration: 90,
      });

      expect(mockReservation.table).toBe('table-456');
      expect(mockReservation.numberOfGuests).toBe(6);
      expect(mockReservation.duration).toBe(90);
    });
  });

  describe('cancelReservationByCustomer', () => {
    it('should cancel reservation', async () => {
      const mockReservation = {
        _id: 'reservation-123',
        customer: 'customer-123',
        bookingStatus: 'pending',
        save: jest.fn().mockResolvedValue({ bookingStatus: 'canceled' }),
      };

      mockReservationModel.findOne.mockResolvedValue(mockReservation);

      const result = await service.cancelReservationByCustomer('reservation-123', 'customer-123');

      expect(mockReservation.bookingStatus).toBe('canceled');
      expect(mockReservation.save).toHaveBeenCalled();
    });

    it('should return null when not found or unauthorized', async () => {
      mockReservationModel.findOne.mockResolvedValue(null);

      const result = await service.cancelReservationByCustomer('reservation-123', 'wrong-customer');

      expect(result).toBeNull();
    });
  });

  describe('cancelReservationByAdmin', () => {
    it('should cancel reservation without customer check', async () => {
      const mockReservation = {
        _id: 'reservation-123',
        bookingStatus: 'pending',
        save: jest.fn().mockResolvedValue({ bookingStatus: 'canceled' }),
      };

      mockReservationModel.findById.mockResolvedValue(mockReservation);

      const result = await service.cancelReservationByAdmin('reservation-123');

      expect(mockReservation.bookingStatus).toBe('canceled');
      expect(mockReservation.save).toHaveBeenCalled();
    });

    it('should return null when not found', async () => {
      mockReservationModel.findById.mockResolvedValue(null);

      const result = await service.cancelReservationByAdmin('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('confirmReservation', () => {
    it('should confirm pending reservation', async () => {
      const mockReservation = {
        _id: 'reservation-123',
        bookingStatus: 'pending',
        save: jest.fn().mockResolvedValue({ bookingStatus: 'confirmed' }),
      };

      mockReservationModel.findById.mockResolvedValue(mockReservation);

      const result = await service.confirmReservation('reservation-123');

      expect(mockReservation.bookingStatus).toBe('confirmed');
      expect(mockReservation.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when confirming canceled reservation', async () => {
      const mockReservation = {
        _id: 'reservation-123',
        bookingStatus: 'canceled',
      };

      mockReservationModel.findById.mockResolvedValue(mockReservation);

      await expect(service.confirmReservation('reservation-123')).rejects.toThrow(BadRequestException);
      await expect(service.confirmReservation('reservation-123')).rejects.toThrow('Cannot confirm a canceled reservation');
    });

    it('should return null when not found', async () => {
      mockReservationModel.findById.mockResolvedValue(null);

      const result = await service.confirmReservation('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('deleteReservation', () => {
    it('should delete reservation', async () => {
      const mockReservation = createMockReservation();
      mockReservationModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockReservation) });

      const result = await service.deleteReservation('reservation-123');

      expect(mockReservationModel.findByIdAndDelete).toHaveBeenCalledWith('reservation-123');
      expect(result).toEqual(mockReservation);
    });

    it('should return null when not found', async () => {
      mockReservationModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await service.deleteReservation('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getTableReservations', () => {
    it('should return reservations for specific table and date', async () => {
      const date = new Date('2025-12-15');
      const mockReservations = [createMockReservation(), createMockReservation({ _id: 'reservation-2' })];

      mockReservationModel.find.mockReturnValue(mockPopulateChain(mockReservations));

      const result = await service.getTableReservations('table-123', date);

      expect(mockReservationModel.find).toHaveBeenCalledWith({
        table: 'table-123',
        reservationDate: expect.objectContaining({
          $gte: expect.any(Date),
          $lte: expect.any(Date),
        }),
        bookingStatus: { $in: ['pending', 'confirmed'] },
      });
      expect(result).toEqual(mockReservations);
    });

    it('should return empty array when no reservations', async () => {
      mockReservationModel.find.mockReturnValue(mockPopulateChain([]));

      const result = await service.getTableReservations('table-123', new Date('2025-12-15'));

      expect(result).toEqual([]);
    });
  });
});
