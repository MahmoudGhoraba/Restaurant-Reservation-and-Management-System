import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenuItem } from '../models/menuitem.schema';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel('MenuItem') private menuItemModel: Model<IMenuItem>,
  ) {}

  async createMenuItem(menuItemDetails: Partial<IMenuItem>): Promise<IMenuItem> {
    const menuitem = new this.menuItemModel(menuItemDetails);
    return menuitem.save();
  }

  async getMenuItemById(id: string): Promise<IMenuItem | null> {
    return this.menuItemModel.findById(id).exec();
  }

  async updateMenuItem(id: string, updateDetails: Partial<IMenuItem>): Promise<IMenuItem | null> {
    return this.menuItemModel.findByIdAndUpdate(id, updateDetails, { new: true }).exec();
  }

  async deleteMenuItem(id: string): Promise<IMenuItem | null> {
    return this.menuItemModel.findByIdAndDelete(id).exec();
  }

  async getAllMenuItems(): Promise<IMenuItem[]> {
    return this.menuItemModel.find().exec();
  }
}
