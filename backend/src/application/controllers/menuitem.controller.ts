import { Request, Response, NextFunction } from "express";
import MenuItemService from "../services/menuitem.service";
import AppError from "../../infrastructure/utils/appError";
import catchAsync from "../../infrastructure/utils/catchAsync";

class MenuItemController {
    createMenuItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const menuItemDetails = req.body
        if (!menuItemDetails || Object.keys(menuItemDetails).length === 0) {
            return next(new AppError("the item you were trying to add is missing important details", 400))
        }
        /*if (!req.user?.id) {
            return next(new AppError("the user is not authenticated", 401))
        }
          if (req.user.role !== 'Admin') {
             return next(new AppError("the user is authenticated but doesnt have the right access level", 403))
        }*/
        const item = await MenuItemService.createMenuItem(menuItemDetails)
        res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            data: item
        });
    })

    getAllMenuItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const items = await MenuItemService.getAllMenuItems();
        if (!items || items.length === 0) {
            return next(new AppError("NO_MENU_ITEMS_FOUND", 404))
        }
        res.status(200).json({
            success: true,
            message: "Menu items retrieved successfully",
            data: items
        });
    })
    
    getMenuItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id
        if (!id) {
            return next(new AppError("enetr an id", 400))
        }
        const item = await MenuItemService.getMenuItemById(id);
        if (!item) {
            return next(new AppError("Error this id doesnt exist", 404))
        }
        res.status(200).json({
            success: true,
            message: "Menu item retrieved successfully",
            data: item
        });
    })
    updateMenuItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id
        const menuItemDetails = req.body

        if (!id || !menuItemDetails || Object.keys(menuItemDetails).length === 0) {
            return next(new AppError("enetr an id", 400))
        }
        /*if (!req.user?.id) {
          return next(new AppError("the user is not authenticated", 401))
      }
        if (req.user.role !== 'Admin') {
           return next(new AppError("the user is authenticated but doesnt have the right access level", 403))
      }*/
        const item = await MenuItemService.updateMenuItem(id, menuItemDetails);
        if (!item) {
            return next(new AppError("Error this id doesnt exist", 404))
        }
        res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            data: item
        });
    })

    deleteMenuItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id
        if (!id) {
            return next(new AppError("enetr an id", 400))
        }
        /*if (!req.user?.id) {
          return next(new AppError("the user is not authenticated", 401))
      }
        if (req.user.role !== 'Admin') {
           return next(new AppError("the user is authenticated but doesnt have the right access level", 403))
      }*/
        const item = await MenuItemService.deleteMenuItem(id);
        if (!item) {
            return next(new AppError("Error this id doesnt exist", 404))
        }
        res.status(200).json({
            success: true,
            message: "Menu item deleted successfully",
            data: item
        });
    })
}
export default new MenuItemController;