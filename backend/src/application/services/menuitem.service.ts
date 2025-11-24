import { IMenuItem, MenuItem } from "../../data/models/menuitem.schema";
import { Document } from "mongoose";

export interface IMenuItemService {
  createMenuItem(
    menuItemDetails: Partial<IMenuItem & Document>
  ): Promise<IMenuItem & Document>;
  getMenuItemById(id: string): Promise<(IMenuItem & Document) | null>;
  updateMenuItem(
    id: string,
    updateDetails: Partial<IMenuItem & Document>
  ): Promise<(IMenuItem & Document) | null>;
  deleteMenuItem(id: string): Promise<(IMenuItem & Document) | null>;
}

class MenuItemService implements IMenuItemService {
  async createMenuItem(
    menuItemDetails: Partial<IMenuItem & Document>
  ): Promise<IMenuItem & Document> {
    const menuitem = new MenuItem(menuItemDetails)
    return menuitem.save()
  }

  async getMenuItemById(id: string): Promise<(IMenuItem & Document) | null> {
    const item = await MenuItem.findById(id)
    return item;
  }

  async updateMenuItem(id: string, updateDetails: Partial<IMenuItem & Document>
  ): Promise<(IMenuItem & Document) | null> {
    const item = await MenuItem.findByIdAndUpdate(id, updateDetails, { new: true })
    return item;

  }

  async deleteMenuItem(id: string): Promise<(IMenuItem & Document) | null> {
    const item = await MenuItem.findByIdAndDelete(id);
    return item;
  }


}
export default new MenuItemService;