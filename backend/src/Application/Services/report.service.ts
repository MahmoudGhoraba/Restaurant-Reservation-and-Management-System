import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IReport } from '../../Data/models/report.schema';
import { IOrderDocument } from '../../Data/models/order.schema';
import { IReservation } from '../../Data/models/reservation.schema';
import { IFeedback } from '../../Data/models/feedback.schema';
import { GenerateReportDto } from '../../Data/Dto/report_dto/generate-report.dto';

@Injectable()
export class ReportService {
    constructor(
        @InjectModel('Report') private reportModel: Model<IReport>,
        @InjectModel('Order') private orderModel: Model<IOrderDocument>,
        @InjectModel('Reservation') private reservationModel: Model<IReservation>,
        @InjectModel('Feedback') private feedbackModel: Model<IFeedback>,
    ) { }

    async generateReport(generateReportDto: GenerateReportDto, userId: string) {
        const { reportType, startDate, endDate } = generateReportDto;

        // Normalize date range: make endDate inclusive for the entire day.
        // This prevents empty results when start and end are the same calendar date.
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (end) {
            // set end to end of day (23:59:59.999)
            end.setUTCHours(23, 59, 59, 999);
        }

        let content: any;

        switch (reportType) {
            case 'Sales':
                content = await this.generateSalesReport(start, end);
                break;
            case 'Reservation':
                content = await this.generateReservationReport(start, end);
                break;
            case 'Staff Performance':
                content = await this.generateStaffPerformanceReport(start, end, generateReportDto.staffId);
                break;
            case 'Feedback':
                content = await this.generateFeedbackReport(start, end);
                break;
        }

        const report = await this.reportModel.create({
            generatedBy: userId,
            reportType,
            content,
        });

        return {
            status: 'success',
            data: report,
        };
    }

    private async generateSalesReport(startDate: Date | null, endDate: Date | null) {
        const match: any = {};
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = startDate;
            if (endDate) match.createdAt.$lte = endDate;
        }

        const orders = await this.orderModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalPrice' },
                },
            },
        ]);

        const ordersByType = await this.orderModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$orderType',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' },
                },
            },
        ]);

        const ordersByPayment = await this.orderModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$paymentType',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' },
                },
            },
        ]);

        const dailySales = await this.orderModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return {
            summary: orders[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
            byOrderType: ordersByType,
            byPaymentType: ordersByPayment,
            dailyBreakdown: dailySales,
            period: { startDate, endDate },
        };
    }

    private async generateReservationReport(startDate: Date | null, endDate: Date | null) {
        const match: any = {};
        if (startDate || endDate) {
            match.reservationDate = {};
            if (startDate) match.reservationDate.$gte = startDate;
            if (endDate) match.reservationDate.$lte = endDate;
        }

        const reservations = await this.reservationModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalReservations: { $sum: 1 },
                    avgPartySize: { $avg: '$numberOfGuests' },
                },
            },
        ]);

        const reservationsByStatus = await this.reservationModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$bookingStatus',
                    count: { $sum: 1 },
                },
            },
        ]);

        const dailyReservations = await this.reservationModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$reservationDate' } },
                    count: { $sum: 1 },
                    totalGuests: { $sum: '$numberOfGuests' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const peakHours = await this.reservationModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $hour: '$reservationDate' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        return {
            summary: reservations[0] || { totalReservations: 0, avgPartySize: 0 },
            byStatus: reservationsByStatus,
            dailyBreakdown: dailyReservations,
            peakHours,
            period: { startDate, endDate },
        };
    }

    private async generateStaffPerformanceReport(startDate: Date | null, endDate: Date | null, staffId?: string) {
        const matchStage: any = {};
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = startDate;
            if (endDate) matchStage.createdAt.$lte = endDate;
        }

        if (staffId) {
            matchStage.handledBy = staffId;
        }

        const orderStats = await this.orderModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$handledBy',
                    ordersHandled: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' },
                    avgOrderValue: { $avg: '$totalPrice' },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'staffDetails',
                },
            },
            { $unwind: { path: '$staffDetails', preserveNullAndEmptyArrays: true } },
        ]);

        return {
            staffPerformance: orderStats,
            period: { startDate, endDate },
        };
    }

    private async generateFeedbackReport(startDate: Date | null, endDate: Date | null) {
        const match: any = {};
        if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = startDate;
            if (endDate) match.date.$lte = endDate;
        }

        const feedbackStats = await this.feedbackModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalFeedback: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                },
            },
        ]);

        const ratingDistribution = await this.feedbackModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: -1 } },
        ]);

        const recentFeedback = await this.feedbackModel
            .find(match)
            .sort({ date: -1 })
            .limit(10)
            .populate('customer', 'name email');

        return {
            summary: feedbackStats[0] || { totalFeedback: 0, avgRating: 0 },
            ratingDistribution,
            recentFeedback,
            period: { startDate, endDate },
        };
    }

    async getAllReports() {
        const reports = await this.reportModel
            .find()
            .populate('generatedBy', 'name email')
            .sort({ generatedDate: -1 });

        return {
            status: 'success',
            data: reports,
        };
    }

    async getReportById(id: string) {
        const report = await this.reportModel
            .findById(id)
            .populate('generatedBy', 'name email');

        if (!report) {
            throw new Error('Report not found');
        }

        return {
            status: 'success',
            data: report,
        };
    }

    async getReportsByType(type: string) {
        const reports = await this.reportModel
            .find({ reportType: type })
            .populate('generatedBy', 'name email')
            .sort({ generatedDate: -1 });

        return {
            status: 'success',
            data: reports,
        };
    }

    async deleteReport(id: string) {
        const report = await this.reportModel.findByIdAndDelete(id);

        if (!report) {
            throw new Error('Report not found');
        }

        return {
            status: 'success',
            message: 'Report deleted successfully',
        };
    }
}
