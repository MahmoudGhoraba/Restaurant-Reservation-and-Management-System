import { Request, Response, NextFunction} from 'express';
import ReportService from '../services/report.service';
import catchAsync from '../../infrastructure/utils/catchAsync';
import AppError from '../../infrastructure/utils/appError';

class ReportController {
    generateReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const report = await ReportService.generateReport(req.body);
        res.status(201).json({
            status: 'success',
            data: report
        });
    });

    getReportById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const report = await ReportService.getReportById(req.params.id);
        if(!report) {
            return next(new AppError('Report not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: report
        });
    })
    ;

    getAllReports = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { role } = req.body;
        if (role !== "Admin" && role !== "admin") {
            return next(new AppError('You are not authorized to access this resource', 403));
        }
        const filters = req.query;
        const reports = await ReportService.getAllReports(filters);
        res.status(200).json({
            status: 'success',
            results: reports.length,
            data: reports
        });
    });

    deleteReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { role } = req.body;
        if (role !== "Admin" && role !== "admin") {
            return next(new AppError('You are not authorized to access this resource', 403));
        }
        const report = await ReportService.deleteReport(req.params.id);
        if(!report) {
            return next(new AppError('Report not found', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    });
}   
export default new ReportController();