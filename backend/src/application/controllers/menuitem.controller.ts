import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { MenuItemService } from '../services/menuitem.service';
import { JwtAuthGuard } from '../../middlewares/authMiddleware';
import { AdminGuard } from '../../middlewares/allowAdminMiddleware';
import { CreateMenuItemDto, UpdateMenuItemDto } from '../../data/dtos';

@Controller('menu-items')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createMenuItem(@Body() dto: CreateMenuItemDto, @Request() req) {
    dto.createdBy = req.user.id;
    return this.menuItemService.createMenuItem(dto);
  }

  @Get()
  async getAllMenuItems() {
    return this.menuItemService.getAllMenuItems();
  }

  @Get('category/:category')
  async getMenuItemsByCategory(@Param('category') category: string) {
    return this.menuItemService.getMenuItemsByCategory(category);
  }

  @Get(':id')
  async getMenuItemById(@Param('id') id: string) {
    return this.menuItemService.getMenuItemById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateMenuItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuItemService.updateMenuItem(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteMenuItem(@Param('id') id: string) {
    await this.menuItemService.deleteMenuItem(id);
  }
}