import { Controller, Get, Post, Param, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../middlewares/authMiddleware';
import { AdminGuard } from '../../middlewares/allowAdminMiddleware';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('tables')
  async getAllTables() {
    return this.adminService.getAllTables();
  }

  @Get('reservations')
  async getAllReservations() {
    return this.adminService.getAllReservations();
  }

  @Get('orders')
  async getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Post('reports/sales')
  async generateSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('adminId') adminId: string
  ) {
    if (!startDate || !endDate || !adminId) {
      throw new HttpException('startDate, endDate, and adminId are required', HttpStatus.BAD_REQUEST);
    }
    return this.adminService.generateSalesReport(adminId, new Date(startDate), new Date(endDate));
  }

  @Post('reports/reservations')
  async generateReservationReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('adminId') adminId: string
  ) {
    if (!startDate || !endDate || !adminId) {
      throw new HttpException('startDate, endDate, and adminId are required', HttpStatus.BAD_REQUEST);
    }
    return this.adminService.generateReservationReport(adminId, new Date(startDate), new Date(endDate));
  }

  @Post('reports/feedback')
  async generateFeedbackReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('adminId') adminId: string
  ) {
    if (!startDate || !endDate || !adminId) {
      throw new HttpException('startDate, endDate, and adminId are required', HttpStatus.BAD_REQUEST);
    }
    return this.adminService.generateFeedbackReport(adminId, new Date(startDate), new Date(endDate));
  }
}