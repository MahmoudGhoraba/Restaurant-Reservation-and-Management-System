import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { JwtAuthGuard } from '../../middlewares/authMiddleware';
import { AdminGuard } from '../../middlewares/allowAdminMiddleware';

@Controller('reports')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async generateReport(@Body() dto: any, @Request() req) {
    const reportData = {
      generatedBy: req.user.id,
      reportType: dto.reportType,
      title: dto.title,
      description: dto.description,
      dateRange: dto.dateRange,
      content: dto.content,
    };
    return this.reportService.generateReport(reportData);
  }

  @Get()
  async getAllReports(@Query() filters: { reportType?: string; generatedBy?: string }) {
    return this.reportService.getAllReports(filters);
  }

  @Get('type/:reportType')
  async getReportsByType(@Param('reportType') reportType: string) {
    return this.reportService.getReportsByType(reportType);
  }

  @Get(':id')
  async getReportById(@Param('id') id: string) {
    return this.reportService.getReportById(id);
        }

  @Delete(':id')
  async deleteReport(@Param('id') id: string) {
    await this.reportService.deleteReport(id);
  }
}