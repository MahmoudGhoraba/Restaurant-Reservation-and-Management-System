import { MenuItemController } from '../../src/Application/Controllers/menuitem.controller';
import { MenuItemService } from '../../src/Application/Services/menuitem.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MenuItemController', () => {
  let controller: MenuItemController;
  let service: Partial<Record<keyof MenuItemService, jest.Mock>>;

  beforeEach(() => {
    service = {
      createMenuItem: jest.fn(),
      getAllMenuItems: jest.fn(),
      getMenuItemById: jest.fn(),
      updateMenuItem: jest.fn(),
      deleteMenuItem: jest.fn(),
    } as any;

    controller = new MenuItemController(service as any);
  });

  describe('createMenuItem', () => {
    it('throws BadRequestException when body is empty', async () => {
      await expect(controller.createMenuItem({} as any)).rejects.toThrow(BadRequestException);
    });

    it('creates and returns success response', async () => {
      const dto = { name: 'Pasta' } as any;
      (service.createMenuItem as jest.Mock).mockResolvedValue({ _id: '1', ...dto });

      const res = await controller.createMenuItem(dto);

      expect(service.createMenuItem).toHaveBeenCalledWith(dto);
      expect(res).toHaveProperty('success', true);
      expect(res).toHaveProperty('data');
    });
  });

  describe('getAllMenuItems', () => {
    it('returns items when present', async () => {
      (service.getAllMenuItems as jest.Mock).mockResolvedValue([{ _id: '1' }]);

      const res = await controller.getAllMenuItems();

      expect(res).toHaveProperty('success', true);
      expect(res.data).toEqual([{ _id: '1' }]);
    });

    it('throws NotFoundException when none found', async () => {
      (service.getAllMenuItems as jest.Mock).mockResolvedValue([]);

      await expect(controller.getAllMenuItems()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMenuItem', () => {
    it('throws BadRequestException when id missing', async () => {
      await expect(controller.getMenuItem('' as any)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when not found', async () => {
      (service.getMenuItemById as jest.Mock).mockResolvedValue(null);

      await expect(controller.getMenuItem('nope')).rejects.toThrow(NotFoundException);
    });

    it('returns item when found', async () => {
      (service.getMenuItemById as jest.Mock).mockResolvedValue({ _id: '1' });

      const res = await controller.getMenuItem('1');

      expect(res.data).toEqual({ _id: '1' });
    });
  });

  describe('updateMenuItem', () => {
    it('throws BadRequestException when id or body missing', async () => {
      await expect(controller.updateMenuItem('' as any, {} as any)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when id does not exist', async () => {
      (service.updateMenuItem as jest.Mock).mockResolvedValue(null);

      await expect(controller.updateMenuItem('nope', { name: 'x' } as any)).rejects.toThrow(NotFoundException);
    });

    it('returns success when updated', async () => {
      (service.updateMenuItem as jest.Mock).mockResolvedValue({ _id: '1', name: 'updated' });

      const res = await controller.updateMenuItem('1', { name: 'updated' } as any);

      expect(res).toHaveProperty('success', true);
      expect(res.data).toEqual({ _id: '1', name: 'updated' });
    });
  });

  describe('deleteMenuItem', () => {
    it('throws BadRequestException when id missing', async () => {
      await expect(controller.deleteMenuItem('' as any)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when id not found', async () => {
      (service.deleteMenuItem as jest.Mock).mockResolvedValue(null);

      await expect(controller.deleteMenuItem('nope')).rejects.toThrow(NotFoundException);
    });

    it('returns success when deleted', async () => {
      (service.deleteMenuItem as jest.Mock).mockResolvedValue({ _id: '1', name: 'deleted' });

      const res = await controller.deleteMenuItem('1');

      expect(res).toHaveProperty('success', true);
      expect(res.data).toEqual({ _id: '1', name: 'deleted' });
    });
  });
});
