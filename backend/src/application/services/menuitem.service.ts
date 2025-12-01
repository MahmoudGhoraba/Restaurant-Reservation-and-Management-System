import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from '../../data/models/menuitem.schema';
import { CreateMenuItemDto, UpdateMenuItemDto } from '../../data/dtos';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
  ) {}

  async createMenuItem(data: CreateMenuItemDto): Promise<MenuItemDocument> {
    const menuItem = new this.menuItemModel(data);
    return menuItem.save();
  }

  async getMenuItemById(id: string): Promise<MenuItemDocument> {
    const item = await this.menuItemModel.findById(id);
    if (!item) {
      throw new Error('MENU_ITEM_NOT_FOUND');
    }
    return item;
  }

  async updateMenuItem(id: string, data: UpdateMenuItemDto): Promise<MenuItemDocument> {
    const item = await this.menuItemModel.findByIdAndUpdate(id, data, { new: true });
    if (!item) {
      throw new Error('MENU_ITEM_NOT_FOUND');
    }
    return item;
  }

  async deleteMenuItem(id: string): Promise<void> {
    const item = await this.menuItemModel.findByIdAndDelete(id);
    if (!item) {
      throw new Error('MENU_ITEM_NOT_FOUND');
    }
  }

  async getAllMenuItems(): Promise<MenuItemDocument[]> {
    return this.menuItemModel.find({ isAvailable: true });
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItemDocument[]> {
    return this.menuItemModel.find({ category, isAvailable: true });
  }
}