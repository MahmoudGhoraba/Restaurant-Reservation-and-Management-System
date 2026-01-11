import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemService } from './menuitem.service';
import { getModelToken } from '@nestjs/mongoose';

describe('MenuItemService', () => {
  let service: MenuItemService;

  const mockMenuItemModel: any = jest.fn();
  mockMenuItemModel.findById = jest.fn();
  mockMenuItemModel.findByIdAndUpdate = jest.fn();
  mockMenuItemModel.findByIdAndDelete = jest.fn();
  mockMenuItemModel.find = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemService,
        { provide: getModelToken('MenuItem'), useValue: mockMenuItemModel },
      ],
    }).compile();

    service = module.get<MenuItemService>(MenuItemService);
  });

  describe('createMenuItem', () => {
    it('should create a new menu item', async () => {
      const menuItemDetails = {
        name: 'Burger',
        description: 'Delicious burger',
        price: 10.99,
        availability: true,
        category: 'Mains',
      };

      const savedMenuItem = {
        _id: 'menuitem-id',
        ...menuItemDetails,
      };

      mockMenuItemModel.mockImplementation((payload) => ({
        save: jest.fn().mockResolvedValue({ ...payload, ...savedMenuItem }),
      }));

      const result = await service.createMenuItem(menuItemDetails);

      expect(result).toBeDefined();
      expect(result._id).toBe('menuitem-id');
    });
  });

  describe('getMenuItemById', () => {
    it('should return a menu item by ID', async () => {
      const menuItemId = 'menuitem-id';
      const mockMenuItem = {
        _id: menuItemId,
        name: 'Burger',
        price: 10.99,
        availability: true,
      };

      mockMenuItemModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMenuItem),
      });

      const result = await service.getMenuItemById(menuItemId);

      expect(result).toEqual(mockMenuItem);
      expect(mockMenuItemModel.findById).toHaveBeenCalledWith(menuItemId);
    });

    it('should return null if menu item not found', async () => {
      mockMenuItemModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getMenuItemById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateMenuItem', () => {
    it('should update a menu item', async () => {
      const menuItemId = 'menuitem-id';
      const updateDetails = {
        price: 12.99,
        availability: false,
      };

      const updatedMenuItem = {
        _id: menuItemId,
        name: 'Burger',
        ...updateDetails,
      };

      mockMenuItemModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedMenuItem),
      });

      const result = await service.updateMenuItem(menuItemId, updateDetails);

      expect(result).toEqual(updatedMenuItem);
      expect(mockMenuItemModel.findByIdAndUpdate).toHaveBeenCalledWith(
        menuItemId,
        updateDetails,
        { new: true }
      );
    });

    it('should return null if menu item to update not found', async () => {
      mockMenuItemModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.updateMenuItem('nonexistent-id', { price: 15.99 });

      expect(result).toBeNull();
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete a menu item', async () => {
      const menuItemId = 'menuitem-id';
      const deletedMenuItem = {
        _id: menuItemId,
        name: 'Burger',
        price: 10.99,
      };

      mockMenuItemModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedMenuItem),
      });

      const result = await service.deleteMenuItem(menuItemId);

      expect(result).toEqual(deletedMenuItem);
      expect(mockMenuItemModel.findByIdAndDelete).toHaveBeenCalledWith(menuItemId);
    });

    it('should return null if menu item to delete not found', async () => {
      mockMenuItemModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.deleteMenuItem('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAllMenuItems', () => {
    it('should return all menu items', async () => {
      const mockMenuItems = [
        { _id: '1', name: 'Burger', price: 10.99, availability: true },
        { _id: '2', name: 'Pizza', price: 15.99, availability: true },
        { _id: '3', name: 'Salad', price: 8.99, availability: false },
      ];

      mockMenuItemModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMenuItems),
      });

      const result = await service.getAllMenuItems();

      expect(result).toEqual(mockMenuItems);
      expect(result).toHaveLength(3);
      expect(mockMenuItemModel.find).toHaveBeenCalled();
    });

    it('should return empty array if no menu items exist', async () => {
      mockMenuItemModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getAllMenuItems();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
