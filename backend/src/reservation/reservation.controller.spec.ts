import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createMockUser, createMockAdmin, createMockReservation } from '../../test/utils/mocks';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: Partial<Record<keyof ReservationService, jest.Mock>>;

  beforeEach(() => {
    service = {
      createReservation: jest.fn(),
      getAllReservations: jest.fn(),
      getReservationById: jest.fn(),
      getReservationsByCustomer: jest.fn(),
      updateReservation: jest.fn(),
      cancelReservationByCustomer: jest.fn(),
      cancelReservationByAdmin: jest.fn(),
      confirmReservation: jest.fn(),
      deleteReservation: jest.fn(),
    } as any;

    controller = new ReservationController(service as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReservation', () => {
    it('should throw BadRequestException when required fields missing', async () => {
      const dto = {} as any;
      const user = createMockUser();

      await expect(controller.createReservation(dto, user)).rejects.toThrow(BadRequestException);
      await expect(controller.createReservation(dto, user)).rejects.toThrow('Please provide table, reservationDate, reservationTime, and numberOfGuests');
    });

    it('should create reservation with user id', async () => {
      const user = createMockUser();
      const dto = {
        table: 'table-123',
        reservationDate: '2025-12-15',
        reservationTime: '18:00',
        numberOfGuests: 4,
      } as any;

      const mockReservation = createMockReservation();
      (service.createReservation as jest.Mock).mockResolvedValue(mockReservation);

      const result = await controller.createReservation(dto, user);

      expect(service.createReservation).toHaveBeenCalledWith({
        customer: user.id,
        table: dto.table,
        reservationDate: new Date(dto.reservationDate),
        reservationTime: dto.reservationTime,
        numberOfGuests: dto.numberOfGuests,
        duration: 60,
      });
      expect(result).toHaveProperty('status', 'success');
      expect(result.data).toEqual(mockReservation);
    });

    it('should use custom duration when provided', async () => {
      const user = createMockUser();
      const dto = {
        table: 'table-123',
        reservationDate: '2025-12-15',
        reservationTime: '18:00',
        numberOfGuests: 4,
        duration: 120,
      } as any;

      (service.createReservation as jest.Mock).mockResolvedValue(createMockReservation());

      await controller.createReservation(dto, user);

      expect(service.createReservation).toHaveBeenCalledWith(
        expect.objectContaining({ duration: 120 })
      );
    });
  });

  describe('getAllReservations', () => {
    it('should return all reservations with results count', async () => {
      const mockReservations = [createMockReservation(), createMockReservation({ _id: 'reservation-2' })];
      (service.getAllReservations as jest.Mock).mockResolvedValue(mockReservations);

      const result = await controller.getAllReservations();

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('results', 2);
      expect(result.data).toEqual(mockReservations);
    });

    it('should return empty array when no reservations', async () => {
      (service.getAllReservations as jest.Mock).mockResolvedValue([]);

      const result = await controller.getAllReservations();

      expect(result.results).toBe(0);
    });
  });

  describe('getMyReservations', () => {
    it('should return customer reservations', async () => {
      const user = createMockUser();
      const mockReservations = [createMockReservation()];
      (service.getReservationsByCustomer as jest.Mock).mockResolvedValue(mockReservations);

      const result = await controller.getMyReservations(user);

      expect(service.getReservationsByCustomer).toHaveBeenCalledWith(user.id);
      expect(result).toHaveProperty('status', 'success');
      expect(result.data).toEqual(mockReservations);
    });

    it('should return empty array when no reservations', async () => {
      (service.getReservationsByCustomer as jest.Mock).mockResolvedValue([]);

      const result = await controller.getMyReservations(createMockUser());

      expect(result.results).toBe(0);
    });
  });

  describe('getReservationById', () => {
    it('should return reservation when found', async () => {
      const mockReservation = createMockReservation();
      (service.getReservationById as jest.Mock).mockResolvedValue(mockReservation);

      const result = await controller.getReservationById('reservation-123');

      expect(service.getReservationById).toHaveBeenCalledWith('reservation-123');
      expect(result).toHaveProperty('status', 'success');
      expect(result.data).toEqual(mockReservation);
    });

    it('should throw NotFoundException when not found', async () => {
      (service.getReservationById as jest.Mock).mockResolvedValue(null);

      await expect(controller.getReservationById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateReservation', () => {
    it('should update reservation with customer id', async () => {
      const user = createMockUser();
      const dto = { table: 'table-456', numberOfGuests: 6 } as any;
      const mockReservation = createMockReservation();

      (service.updateReservation as jest.Mock).mockResolvedValue(mockReservation);

      const result = await controller.updateReservation('reservation-123', dto, user);

      expect(service.updateReservation).toHaveBeenCalledWith(
        'reservation-123',
        user.id,
        expect.objectContaining({ table: 'table-456', numberOfGuests: 6 })
      );
      expect(result).toHaveProperty('status', 'success');
    });

    it('should throw NotFoundException when not found or unauthorized', async () => {
      (service.updateReservation as jest.Mock).mockResolvedValue(null);

      await expect(controller.updateReservation('reservation-123', {} as any, createMockUser()))
        .rejects.toThrow(NotFoundException);
      await expect(controller.updateReservation('reservation-123', {} as any, createMockUser()))
        .rejects.toThrow('Reservation not found or not authorized');
    });

    it('should handle partial updates', async () => {
      const dto = { numberOfGuests: 8 } as any;
      (service.updateReservation as jest.Mock).mockResolvedValue(createMockReservation());

      await controller.updateReservation('reservation-123', dto, createMockUser());

      expect(service.updateReservation).toHaveBeenCalledWith(
        'reservation-123',
        expect.any(String),
        expect.objectContaining({ numberOfGuests: 8 })
      );
    });
  });

  describe('cancelReservation', () => {
    it('should allow customer to cancel their reservation', async () => {
      const user = createMockUser();
      const mockReservation = createMockReservation({ bookingStatus: 'canceled' });

      (service.cancelReservationByCustomer as jest.Mock).mockResolvedValue(mockReservation);

      const result = await controller.cancelReservation('reservation-123', user);

      expect(service.cancelReservationByCustomer).toHaveBeenCalledWith('reservation-123', user.id);
      expect(result).toHaveProperty('status', 'success');
      expect(result.message).toContain('canceled successfully');
    });

    it('should allow admin to cancel any reservation', async () => {
      const admin = createMockAdmin();
      const mockReservation = createMockReservation({ bookingStatus: 'canceled' });

      (service.cancelReservationByAdmin as jest.Mock).mockResolvedValue(mockReservation);

      const result = await controller.cancelReservation('reservation-123', admin);

      expect(service.cancelReservationByAdmin).toHaveBeenCalledWith('reservation-123');
      expect(result.message).toContain('canceled by admin');
    });

    it('should throw NotFoundException when customer reservation not found', async () => {
      (service.cancelReservationByCustomer as jest.Mock).mockResolvedValue(null);

      await expect(controller.cancelReservation('nonexistent', createMockUser())).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when admin reservation not found', async () => {
      (service.cancelReservationByAdmin as jest.Mock).mockResolvedValue(null);

      await expect(controller.cancelReservation('nonexistent', createMockAdmin())).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmReservation', () => {
    it('should confirm reservation', async () => {
      const mockReservation = createMockReservation({ bookingStatus: 'confirmed' });
      (service.confirmReservation as jest.Mock).mockResolvedValue(mockReservation);

      const result = await controller.confirmReservation('reservation-123');

      expect(service.confirmReservation).toHaveBeenCalledWith('reservation-123');
      expect(result).toHaveProperty('status', 'success');
      expect(result.message).toContain('confirmed successfully');
    });

    it('should throw NotFoundException when not found', async () => {
      (service.confirmReservation as jest.Mock).mockResolvedValue(null);

      await expect(controller.confirmReservation('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteReservation', () => {
    it('should delete reservation', async () => {
      (service.deleteReservation as jest.Mock).mockResolvedValue(createMockReservation());

      const result = await controller.deleteReservation('reservation-123');

      expect(service.deleteReservation).toHaveBeenCalledWith('reservation-123');
      expect(result).toHaveProperty('status', 'success');
      expect(result.data).toBeNull();
    });

    it('should throw NotFoundException when not found', async () => {
      (service.deleteReservation as jest.Mock).mockResolvedValue(null);

      await expect(controller.deleteReservation('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
