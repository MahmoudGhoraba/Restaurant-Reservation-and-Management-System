import { Test, TestingModule } from '@nestjs/testing';
import { TableService } from './table.service';
import { getModelToken } from '@nestjs/mongoose';

describe('TableService', () => {
  let service: TableService;

  const mockTableModel: any = jest.fn();
  mockTableModel.findById = jest.fn();
  mockTableModel.findByIdAndUpdate = jest.fn();
  mockTableModel.findByIdAndDelete = jest.fn();
  mockTableModel.find = jest.fn();

  const mockReservationModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        { provide: getModelToken('Table'), useValue: mockTableModel },
        { provide: getModelToken('Reservation'), useValue: mockReservationModel },
      ],
    }).compile();

    service = module.get<TableService>(TableService);
  });

  describe('createTable', () => {
    it('should create a new table', async () => {
      const tableDetails = {
        capacity: 4,
        location: 'Main Hall',
        status: 'Available' as const,
      };

      const savedTable = {
        _id: 'table-id',
        ...tableDetails,
      };

      mockTableModel.mockImplementation((payload) => ({
        save: jest.fn().mockResolvedValue({ ...payload, ...savedTable }),
      }));

      const result = await service.createTable(tableDetails);

      expect(result).toBeDefined();
      expect(result._id).toBe('table-id');
      expect(result.capacity).toBe(4);
    });
  });

  describe('updateTable', () => {
    it('should update a table', async () => {
      const tableId = 'table-id';
      const updateDetails = {
        capacity: 6,
        location: 'VIP Section',
      };

      const updatedTable = {
        _id: tableId,
        ...updateDetails,
        status: 'Available',
      };

      mockTableModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedTable),
      });

      const result = await service.updateTable(tableId, updateDetails);

      expect(result).toEqual(updatedTable);
      expect(mockTableModel.findByIdAndUpdate).toHaveBeenCalledWith(
        tableId,
        updateDetails,
        { new: true }
      );
    });

    it('should return null if table to update not found', async () => {
      mockTableModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.updateTable('nonexistent-id', { capacity: 8 });

      expect(result).toBeNull();
    });
  });

  describe('getTable', () => {
    it('should return a table by ID', async () => {
      const tableId = 'table-id';
      const mockTable = {
        _id: tableId,
        capacity: 4,
        location: 'Main Hall',
        status: 'Available',
      };

      mockTableModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTable),
      });

      const result = await service.getTable(tableId);

      expect(result).toEqual(mockTable);
      expect(mockTableModel.findById).toHaveBeenCalledWith(tableId);
    });

    it('should return null if table not found', async () => {
      mockTableModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getTable('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAllTables', () => {
    it('should return all tables', async () => {
      const mockTables = [
        { _id: '1', capacity: 4, location: 'Main Hall', status: 'Available' },
        { _id: '2', capacity: 2, location: 'Patio', status: 'Reserved' },
        { _id: '3', capacity: 6, location: 'VIP', status: 'Available' },
      ];

      mockTableModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTables),
      });

      const result = await service.getAllTables();

      expect(result).toEqual(mockTables);
      expect(result).toHaveLength(3);
      expect(mockTableModel.find).toHaveBeenCalled();
    });

    it('should return empty array if no tables exist', async () => {
      mockTableModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getAllTables();

      expect(result).toEqual([]);
    });
  });

  describe('deleteTable', () => {
    it('should delete a table', async () => {
      const tableId = 'table-id';
      const deletedTable = {
        _id: tableId,
        capacity: 4,
        location: 'Main Hall',
      };

      mockTableModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedTable),
      });

      const result = await service.deleteTable(tableId);

      expect(result).toEqual(deletedTable);
      expect(mockTableModel.findByIdAndDelete).toHaveBeenCalledWith(tableId);
    });

    it('should return null if table to delete not found', async () => {
      mockTableModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.deleteTable('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('checkTableAvailability', () => {
    it('should return true if table is available', async () => {
      const tableId = 'table-id';
      const reservationDate = new Date('2025-12-20');
      const reservationTime = '18:00';
      const duration = 60;

      mockReservationModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.checkTableAvailability(
        tableId,
        reservationDate,
        reservationTime,
        duration
      );

      expect(result).toBe(true);
      expect(mockReservationModel.find).toHaveBeenCalled();
    });

    it('should return false if table has overlapping reservations', async () => {
      const tableId = 'table-id';
      const reservationDate = new Date('2025-12-20');
      const reservationTime = '18:00';
      const duration = 60;

      const existingReservations = [
        {
          _id: 'res-id',
          table: tableId,
          reservationDate,
          reservationTime: '17:30',
          duration: 90,
          bookingStatus: 'confirmed',
        },
      ];

      mockReservationModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingReservations),
      });

      const result = await service.checkTableAvailability(
        tableId,
        reservationDate,
        reservationTime,
        duration
      );

      expect(result).toBe(false);
    });

    it('should exclude specific reservation when checking availability', async () => {
      const tableId = 'table-id';
      const reservationDate = new Date('2025-12-20');
      const reservationTime = '18:00';
      const duration = 60;
      const excludeReservationId = 'exclude-this-res';

      mockReservationModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.checkTableAvailability(
        tableId,
        reservationDate,
        reservationTime,
        duration,
        excludeReservationId
      );

      expect(result).toBe(true);
      expect(mockReservationModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: { $ne: excludeReservationId },
        })
      );
    });
  });
});
