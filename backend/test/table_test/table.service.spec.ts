import { TableService } from '../Application/Services/table.service';
import { createMockModel, createModelConstructor, mockExec, createMockTable } from '../../test/utils/mocks';

describe('TableService', () => {
  let service: TableService;
  let mockTableModel: any;
  let mockReservationModel: any;

  beforeEach(() => {
    mockTableModel = createMockModel();
    mockReservationModel = createMockModel();

    service = new TableService(
      createModelConstructor(mockTableModel),
      mockReservationModel,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTable', () => {
    it('should create and save table', async () => {
      const details = { tableNumber: 1, capacity: 4, location: 'Main Hall' };

      mockTableModel.asConstructor.mockImplementation((d: any) => ({
        save: jest.fn().mockResolvedValue({ _id: 'table-123', ...d }),
      }));

      const result = await service.createTable(details as any);

      expect(mockTableModel.asConstructor).toHaveBeenCalledWith(details);
      expect(result).toMatchObject(details);
    });

    it('should handle different table capacities', async () => {
      const capacities = [2, 4, 6, 8, 10];

      for (const capacity of capacities) {
        mockTableModel.asConstructor.mockImplementation((d: any) => ({
          save: jest.fn().mockResolvedValue({ _id: `table-${capacity}`, ...d }),
        }));

        const result = await service.createTable({ capacity } as any);

        expect(result.capacity).toBe(capacity);
      }
    });
  });

  describe('updateTable', () => {
    it('should update and return table', async () => {
      const updatedTable = { _id: 'table-123', tableNumber: 1, capacity: 6 };
      mockTableModel.findByIdAndUpdate.mockReturnValue(mockExec(updatedTable));

      const result = await service.updateTable('table-123', { capacity: 6 } as any);

      expect(mockTableModel.findByIdAndUpdate).toHaveBeenCalledWith('table-123', { capacity: 6 }, { new: true });
      expect(result).toEqual(updatedTable);
    });

    it('should return null when table not found', async () => {
      mockTableModel.findByIdAndUpdate.mockReturnValue(mockExec(null));

      const result = await service.updateTable('nonexistent', { capacity: 6 } as any);

      expect(result).toBeNull();
    });
  });

  describe('getTable', () => {
    it('should return table by id', async () => {
      const mockTable = createMockTable();
      mockTableModel.findById.mockReturnValue(mockExec(mockTable));

      const result = await service.getTable('table-123');

      expect(mockTableModel.findById).toHaveBeenCalledWith('table-123');
      expect(result).toEqual(mockTable);
    });

    it('should return null when not found', async () => {
      mockTableModel.findById.mockReturnValue(mockExec(null));

      const result = await service.getTable('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllTables', () => {
    it('should return all tables', async () => {
      const mockTables = [
        createMockTable({ tableNumber: 1 }),
        createMockTable({ _id: 'table-2', tableNumber: 2 }),
      ];

      mockTableModel.find.mockReturnValue(mockExec(mockTables));

      const result = await service.getAllTables();

      expect(mockTableModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockTables);
    });

    it('should return empty array when no tables', async () => {
      mockTableModel.find.mockReturnValue(mockExec([]));

      const result = await service.getAllTables();

      expect(result).toEqual([]);
    });
  });

  describe('deleteTable', () => {
    it('should delete and return table', async () => {
      const mockTable = createMockTable();
      mockTableModel.findByIdAndDelete.mockReturnValue(mockExec(mockTable));

      const result = await service.deleteTable('table-123');

      expect(mockTableModel.findByIdAndDelete).toHaveBeenCalledWith('table-123');
      expect(result).toEqual(mockTable);
    });

    it('should return null when not found', async () => {
      mockTableModel.findByIdAndDelete.mockReturnValue(mockExec(null));

      const result = await service.deleteTable('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('checkTableAvailability', () => {
    it('should return true when no conflicting reservations', async () => {
      mockReservationModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      const result = await service.checkTableAvailability('table-123', new Date('2025-12-15'), '18:00', 60);

      expect(result).toBe(true);
    });

    it('should return false when time slot overlaps', async () => {
      const existingReservation = {
        table: 'table-123',
        reservationDate: new Date('2025-12-15'),
        reservationTime: '18:00',
        duration: 60,
        bookingStatus: 'confirmed',
      };

      mockReservationModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([existingReservation]) });

      const result = await service.checkTableAvailability('table-123', new Date('2025-12-15'), '18:30', 60);

      expect(result).toBe(false);
    });

    it('should return true when time slots do not overlap', async () => {
      const existingReservation = {
        table: 'table-123',
        reservationDate: new Date('2025-12-15'),
        reservationTime: '18:00',
        duration: 60,
        bookingStatus: 'confirmed',
      };

      mockReservationModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([existingReservation]) });

      const result = await service.checkTableAvailability('table-123', new Date('2025-12-15'), '19:30', 60);

      expect(result).toBe(true);
    });

    it('should ignore canceled reservations', async () => {
      const canceledReservation = {
        table: 'table-123',
        reservationDate: new Date('2025-12-15'),
        reservationTime: '18:00',
        duration: 60,
        bookingStatus: 'canceled',
      };

      mockReservationModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      const result = await service.checkTableAvailability('table-123', new Date('2025-12-15'), '18:00', 60);

      expect(result).toBe(true);
    });

    it('should handle edge case: reservation starts when previous ends', async () => {
      const existingReservation = {
        table: 'table-123',
        reservationDate: new Date('2025-12-15'),
        reservationTime: '18:00',
        duration: 60,
        bookingStatus: 'confirmed',
      };

      mockReservationModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([existingReservation]) });

      const result = await service.checkTableAvailability('table-123', new Date('2025-12-15'), '19:00', 60);

      expect(result).toBe(true);
    });

    it('should handle multiple existing reservations', async () => {
      const existingReservations = [
        { reservationTime: '12:00', duration: 60, bookingStatus: 'confirmed' },
        { reservationTime: '14:00', duration: 60, bookingStatus: 'confirmed' },
        { reservationTime: '18:00', duration: 60, bookingStatus: 'confirmed' },
      ];

      mockReservationModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingReservations) });

      // Test available slot between reservations
      const result1 = await service.checkTableAvailability('table-123', new Date('2025-12-15'), '15:30', 60);
      expect(result1).toBe(true);

      // Test conflicting slot
      const result2 = await service.checkTableAvailability('table-123', new Date('2025-12-15'), '13:30', 60);
      expect(result2).toBe(false);
    });
  });

  describe('getAvailableTables', () => {
    it('should return tables not conflicting with reservations', async () => {
      const allReservations = [
        { table: 'table-1', reservationTime: '18:00', duration: 60, bookingStatus: 'confirmed' },
      ];

      const availableTables = [
        createMockTable({ _id: 'table-2', tableNumber: 2 }),
        createMockTable({ _id: 'table-3', tableNumber: 3 }),
      ];

      mockReservationModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(allReservations) });
      mockTableModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(availableTables) });

      const result = await service.getAvailableTables(new Date('2025-12-15'), '18:00', 60);

      expect(result).toEqual(availableTables);
      expect(mockTableModel.find).toHaveBeenCalledWith({
        _id: { $nin: ['table-1'] },
      });
    });

    it('should filter by capacity when provided', async () => {
      mockReservationModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      mockTableModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      await service.getAvailableTables(new Date('2025-12-15'), '18:00', 60, 6);

      expect(mockTableModel.find).toHaveBeenCalledWith({
        _id: { $nin: [] },
        capacity: { $gte: 6 },
      });
    });

    it('should return all tables when no reservations', async () => {
      const allTables = [
        createMockTable({ tableNumber: 1 }),
        createMockTable({ _id: 'table-2', tableNumber: 2 }),
      ];

      mockReservationModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      mockTableModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(allTables) });

      const result = await service.getAvailableTables(new Date('2025-12-15'), '18:00', 60);

      expect(result).toEqual(allTables);
    });

    it('should return empty array when all tables booked', async () => {
      const allReservations = [
        { table: 'table-1', reservationTime: '18:00', duration: 60, bookingStatus: 'confirmed' },
        { table: 'table-2', reservationTime: '18:00', duration: 60, bookingStatus: 'confirmed' },
      ];

      mockReservationModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(allReservations) });
      mockTableModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      const result = await service.getAvailableTables(new Date('2025-12-15'), '18:00', 60);

      expect(result).toEqual([]);
    });
  });
});
