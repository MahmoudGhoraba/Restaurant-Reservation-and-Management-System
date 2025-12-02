import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, BadRequestException, UseGuards } from '@nestjs/common';
import { MenuItemService } from '../Services/menuitem.service';
import { CreateMenuItemDto } from '../../menuitem/dto/create-menuitem.dto';
import { UpdateMenuItemDto } from '../../menuitem/dto/update-menuitem.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('menuitems')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    if (!createMenuItemDto || Object.keys(createMenuItemDto).length === 0) {
      throw new BadRequestException('The item you were trying to add is missing important details');
    }

    const item = await this.menuItemService.createMenuItem(createMenuItemDto);

    return {
      success: true,
      message: 'Menu item created successfully',
      data: item,
    };
  }

  @Get()
  async getAllMenuItems() {
    const items = await this.menuItemService.getAllMenuItems();

    if (!items || items.length === 0) {
      throw new NotFoundException('No menu items found');
    }

    return {
      success: true,
      message: 'Menu items retrieved successfully',
      data: items,
    };
  }

  @Get(':id')
  async getMenuItem(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Enter an id');
    }

    const item = await this.menuItemService.getMenuItemById(id);

    if (!item) {
      throw new NotFoundException('Error: this id does not exist');
    }

    return {
      success: true,
      message: 'Menu item retrieved successfully',
      data: item,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async updateMenuItem(@Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
    if (!id || !updateMenuItemDto || Object.keys(updateMenuItemDto).length === 0) {
      throw new BadRequestException('Enter an id and update details');
    }

    const item = await this.menuItemService.updateMenuItem(id, updateMenuItemDto);

    if (!item) {
      throw new NotFoundException('Error: this id does not exist');
    }

    return {
      success: true,
      message: 'Menu item updated successfully',
      data: item,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async deleteMenuItem(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Enter an id');
    }

    const item = await this.menuItemService.deleteMenuItem(id);

    if (!item) {
      throw new NotFoundException('Error: this id does not exist');
    }

    return {
      success: true,
      message: 'Menu item deleted successfully',
      data: item,
    };
  }
}
