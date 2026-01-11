import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { TableService } from '../Services/table.service';
import { CreateTableDto } from '../../Data/Dto/table_dtos/create-table.dto';
import { UpdateTableDto } from '../../Data/Dto/table_dtos/update-table.dto';
import { CheckAvailabilityDto } from '../../Data/Dto/table_dtos/check-availability.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async createTable(@Body() createTableDto: CreateTableDto) {
    const table = await this.tableService.createTable(createTableDto);

    return {
      success: true,
      message: 'Table created successfully',
      data: table,
    };
  }

  @Get()
  async getAllTables() {
    const tables = await this.tableService.getAllTables();

    if (!tables || tables.length === 0) {
      throw new NotFoundException('No tables found');
    }

    return {
      success: true,
      message: 'Tables retrieved successfully',
      data: tables,
    };
  }

  @Get('available')
  async getAvailableTables(@Query() query: CheckAvailabilityDto) {
    const { date, time, duration = 60, capacity } = query;

    if (!date || !time) {
      throw new BadRequestException('Date and time are required');
    }

    const reservationDate = new Date(date);
    const availableTables = await this.tableService.getAvailableTables(
      reservationDate,
      time,
      duration,
      capacity
    );

    return {
      success: true,
      message: 'Available tables retrieved successfully',
      data: availableTables,
      count: availableTables.length,
    };
  }

  @Get(':id')
  async getTable(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Table ID is required');
    }

    const table = await this.tableService.getTable(id);

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return {
      success: true,
      message: 'Table retrieved successfully',
      data: table,
    };
  }

  @Get(':id/check-availability')
  async checkTableAvailability(
    @Param('id') id: string,
    @Query() query: CheckAvailabilityDto
  ) {
    const { date, time, duration = 60 } = query;

    if (!date || !time) {
      throw new BadRequestException('Date and time are required');
    }

    const reservationDate = new Date(date);
    const isAvailable = await this.tableService.checkTableAvailability(
      id,
      reservationDate,
      time,
      duration
    );

    return {
      success: true,
      message: isAvailable ? 'Table is available' : 'Table is not available',
      available: isAvailable,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async updateTable(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto
  ) {
    if (!id || !updateTableDto || Object.keys(updateTableDto).length === 0) {
      throw new BadRequestException('Table ID and update details are required');
    }

    const table = await this.tableService.updateTable(id, updateTableDto);

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return {
      success: true,
      message: 'Table updated successfully',
      data: table,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async deleteTable(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Table ID is required');
    }

    const table = await this.tableService.deleteTable(id);

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return {
      success: true,
      message: 'Table deleted successfully',
      data: table,
    };
  }
}
