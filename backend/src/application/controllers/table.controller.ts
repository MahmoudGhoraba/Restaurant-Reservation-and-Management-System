import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Query, HttpException, HttpStatus } from '@nestjs/common';
import { TableService } from '../services/table.service';
import { JwtAuthGuard } from '../../middlewares/authMiddleware';
import { AdminGuard } from '../../middlewares/allowAdminMiddleware';
import { CreateTableDto, UpdateTableDto } from '../../data/dtos';

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async createTable(@Body() data: CreateTableDto) {
    try {
      const table = await this.tableService.createTable(data);
      return {
        success: true,
        message: 'Table created successfully',
        data: { table }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to create table' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllTables() {
    try {
      const tables = await this.tableService.getAllTables();
      return {
            success: true,
        data: { tables }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to get tables' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('available')
  async getAvailableTables(
    @Query('date') date: string,
    @Query('time') time: string,
    @Query('guests') guests?: number
  ) {
    try {
      if (!date || !time) {
        throw new Error('Date and time are required');
        }

      const reservationDate = new Date(date);
      const tables = await this.tableService.getAvailableTables(
        reservationDate,
        time,
        60, // Default duration
        guests ? Number(guests) : undefined
      );

      return {
            success: true,
        data: { tables }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to get available tables' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTableById(@Param('id') id: string) {
    try {
      const table = await this.tableService.getTable(id);
      return {
        success: true,
        data: { table }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Table not found' },
        HttpStatus.NOT_FOUND
      );
        }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async updateTable(@Param('id') id: string, @Body() data: UpdateTableDto) {
    try {
      const table = await this.tableService.updateTable(id, data);
      return {
            success: true,
        message: 'Table updated successfully',
        data: { table }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to update table' },
        HttpStatus.BAD_REQUEST
      );
        }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteTable(@Param('id') id: string) {
    try {
      await this.tableService.deleteTable(id);
      return {
            success: true,
        message: 'Table deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to delete table' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/availability')
  async checkTableAvailability(
    @Param('id') tableId: string,
    @Query('date') date: string,
    @Query('time') time: string
  ) {
    try {
        if (!date || !time) {
        throw new Error('Date and time are required');
        }

      const reservationDate = new Date(date);
      const isAvailable = await this.tableService.checkTableAvailability(
        tableId,
            reservationDate,
        time
        );

      return {
            success: true,
        data: { available: isAvailable }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to check availability' },
        HttpStatus.BAD_REQUEST
      );
    }
}
}