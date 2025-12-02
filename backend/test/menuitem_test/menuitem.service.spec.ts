import { MenuItemService } from '../../src/Application/Services/menuitem.service';

describe('MenuItemService', () => {
  let service: MenuItemService;

  const mockExec = (result: any) => ({ exec: jest.fn().mockResolvedValue(result) });

  const mockMenuItemModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    asConstructor: jest.fn((details: any) => ({ save: jest.fn().mockResolvedValue({ _id: '1', ...details }) })),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MenuItemService(mockMenuItemModel as any);
  });

  describe('createMenuItem', () => {
    it('creates and returns the saved menu item', async () => {
      const details = { name: 'Pizza', price: 10 };
      mockMenuItemModel.asConstructor.mockImplementation((d) => ({ save: jest.fn().mockResolvedValue({ _id: 'abc', ...d }) }));

      const fakeModel: any = function (d: any) {
        return mockMenuItemModel.asConstructor(d);
      };

      const svc = new MenuItemService(fakeModel as any);

      const res = await svc.createMenuItem(details as any);

      expect(res).toMatchObject({ _id: 'abc', name: 'Pizza', price: 10 });
    });
  });

  describe('getMenuItemById', () => {
    it('returns the found item', async () => {
      mockMenuItemModel.findById.mockReturnValue(mockExec({ _id: '1', name: 'Burger' }));

      const res = await service.getMenuItemById('1');

      expect(mockMenuItemModel.findById).toHaveBeenCalledWith('1');
      expect(res).toEqual({ _id: '1', name: 'Burger' });
    });

    it('returns null when not found', async () => {
      mockMenuItemModel.findById.mockReturnValue(mockExec(null));

      const res = await service.getMenuItemById('nope');

      expect(res).toBeNull();
    });
  });

  describe('updateMenuItem', () => {
    it('updates and returns the updated item', async () => {
      mockMenuItemModel.findByIdAndUpdate.mockReturnValue(mockExec({ _id: '1', name: 'Updated' }));

      const res = await service.updateMenuItem('1', { name: 'Updated' } as any);

      expect(mockMenuItemModel.findByIdAndUpdate).toHaveBeenCalledWith('1', { name: 'Updated' }, { new: true });
      expect(res).toEqual({ _id: '1', name: 'Updated' });
    });

    it('returns null when id does not exist', async () => {
      mockMenuItemModel.findByIdAndUpdate.mockReturnValue(mockExec(null));

      const res = await service.updateMenuItem('nope', { name: 'x' } as any);

      expect(res).toBeNull();
    });
  });

  describe('deleteMenuItem', () => {
    it('deletes and returns the deleted item', async () => {
      mockMenuItemModel.findByIdAndDelete.mockReturnValue(mockExec({ _id: '1', name: 'ToDelete' }));

      const res = await service.deleteMenuItem('1');

      expect(mockMenuItemModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res).toEqual({ _id: '1', name: 'ToDelete' });
    });

    it('returns null when id not found', async () => {
      mockMenuItemModel.findByIdAndDelete.mockReturnValue(mockExec(null));

      const res = await service.deleteMenuItem('nope');

      expect(res).toBeNull();
    });
  });

  describe('getAllMenuItems', () => {
    it('returns list of items', async () => {
      mockMenuItemModel.find.mockReturnValue(mockExec([{ _id: '1' }, { _id: '2' }]));

      const res = await service.getAllMenuItems();

      expect(mockMenuItemModel.find).toHaveBeenCalled();
      expect(res).toEqual([{ _id: '1' }, { _id: '2' }]);
    });

    it('returns empty array when none', async () => {
      mockMenuItemModel.find.mockReturnValue(mockExec([]));

      const res = await service.getAllMenuItems();

      expect(res).toEqual([]);
    });
  });
});
