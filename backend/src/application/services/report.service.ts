import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../../data/models/report.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async generateReport(data: {
    generatedBy: string;
    reportType: 'Sales' | 'Reservation' | 'Feedback';
    title: string;
    description?: string;
    dateRange: { startDate: Date; endDate: Date };
    content: { summary: Record<string, any>; data: any[] };
  }): Promise<ReportDocument> {
    const report = new this.reportModel({
      reportNumber: await this.generateReportNumber(),
      generatedBy: data.generatedBy,
      reportType: data.reportType,
      title: data.title,
      description: data.description,
      dateRange: data.dateRange,
      content: data.content,
      status: 'Completed',
      generatedAt: new Date(),
        });

    return report.save();
    }

  async getReportById(reportId: string): Promise<ReportDocument> {
    const report = await this.reportModel.findById(reportId)
      .populate('generatedBy', 'name email');
    if (!report) {
      throw new Error('REPORT_NOT_FOUND');
    }
    return report;
  }

  async getAllReports(filters: { reportType?: string; generatedBy?: string } = {}): Promise<ReportDocument[]> {
    const query: any = {};
    if (filters.reportType) {
      query.reportType = filters.reportType;
        }
    if (filters.generatedBy) {
            query.generatedBy = filters.generatedBy;
        }

    return this.reportModel.find(query)
      .populate('generatedBy', 'name email')
      .sort({ generatedAt: -1 });
    }

  async deleteReport(reportId: string): Promise<void> {
    const report = await this.reportModel.findByIdAndDelete(reportId);
    if (!report) {
      throw new Error('REPORT_NOT_FOUND');
    }
  }

  async getReportsByType(reportType: string): Promise<ReportDocument[]> {
    return this.reportModel.find({ reportType })
      .populate('generatedBy', 'name email')
      .sort({ generatedAt: -1 });
  }

  private async generateReportNumber(): Promise<string> {
    const count = await this.reportModel.countDocuments();
    const timestamp = Date.now();
    return `RPT-${timestamp}-${String(count + 1).padStart(4, '0')}`;
  }
}