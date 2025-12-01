import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../../data/models/admin.schema';
import { User, UserDocument } from '../../data/models/user.schema';
import { Table, TableDocument } from '../../data/models/table.schema';
import { Reservation, ReservationDocument } from '../../data/models/reservation.schema';
import { Order, OrderDocument } from '../../data/models/order.schema';
import { Report, ReportDocument } from '../../data/models/report.schema';
import { ReportService } from './report.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    private reportService: ReportService,
  ) {}

  // User Management
  async getAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find();
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, { isActive }, { new: true });
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
  }

  // Table Management
  async getAllTables(): Promise<TableDocument[]> {
    return this.tableModel.find();
  }

  async updateTableStatus(tableId: string, status: string): Promise<TableDocument> {
    const table = await this.tableModel.findByIdAndUpdate(tableId, { status }, { new: true });
    if (!table) {
      throw new Error('TABLE_NOT_FOUND');
    }
    return table;
  }

  // Reservation Management
  async getAllReservations(): Promise<ReservationDocument[]> {
    return this.reservationModel.find()
      .populate('customer', 'name email phone')
      .populate('table', 'tableNumber capacity')
      .populate('assignedStaff', 'name')
      .sort({ reservationDate: -1 });
  }

  async updateReservationStatus(reservationId: string, status: string): Promise<ReservationDocument> {
    const reservation = await this.reservationModel.findByIdAndUpdate(
      reservationId,
      { bookingStatus: status },
      { new: true }
    );
    if (!reservation) {
      throw new Error('RESERVATION_NOT_FOUND');
    }
    return reservation;
  }

  // Order Management
  async getAllOrders(): Promise<OrderDocument[]> {
    return this.orderModel.find()
      .populate('customer', 'name email phone')
      .populate('staff', 'name')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    return order;
  }

  // Reports
  async generateSalesReport(adminId: string, startDate: Date, endDate: Date): Promise<ReportDocument> {
    // Calculate sales data
    const salesData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const summary = salesData[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };

    return this.reportService.generateReport({
      generatedBy: adminId,
      reportType: 'Sales',
      title: 'Sales Report',
      description: `Sales report from ${startDate.toDateString()} to ${endDate.toDateString()}`,
      dateRange: { startDate, endDate },
      content: {
        summary,
        data: salesData
      }
    });
  }

  async generateReservationReport(adminId: string, startDate: Date, endDate: Date): Promise<ReportDocument> {
    const reservationData = await this.reservationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      totalReservations: reservationData.reduce((sum, item) => sum + item.count, 0),
      statusBreakdown: reservationData
    };

    return this.reportService.generateReport({
      generatedBy: adminId,
      reportType: 'Reservation',
      title: 'Reservation Report',
      description: `Reservation report from ${startDate.toDateString()} to ${endDate.toDateString()}`,
      dateRange: { startDate, endDate },
      content: {
        summary,
        data: reservationData
      }
    });
  }

  async generateFeedbackReport(adminId: string, startDate: Date, endDate: Date): Promise<ReportDocument> {
    const feedbackData = await this.reportModel.db.collection('feedbacks').aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]).toArray();

    const summary = feedbackData[0] || {
      totalFeedback: 0,
      averageRating: 0
    };

    return this.reportService.generateReport({
      generatedBy: adminId,
      reportType: 'Feedback',
      title: 'Feedback Report',
      description: `Feedback report from ${startDate.toDateString()} to ${endDate.toDateString()}`,
      dateRange: { startDate, endDate },
      content: {
        summary,
        data: feedbackData
      }
    });
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const [userCount, tableCount, reservationCount, orderCount] = await Promise.all([
      this.userModel.countDocuments(),
      this.tableModel.countDocuments(),
      this.reservationModel.countDocuments(),
      this.orderModel.countDocuments()
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayReservations, todayOrders, pendingReservations] = await Promise.all([
      this.reservationModel.countDocuments({
        reservationDate: { $gte: today, $lt: tomorrow }
      }),
      this.orderModel.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      this.reservationModel.countDocuments({ bookingStatus: 'Pending' })
    ]);

    return {
      totalUsers: userCount,
      totalTables: tableCount,
      totalReservations: reservationCount,
      totalOrders: orderCount,
      todayReservations,
      todayOrders,
      pendingReservations
    };
  }
}