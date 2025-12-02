import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReportService } from 'src/Application/Services/report.service';
import { GenerateReportDto } from '../../Data/Dto/report_dto/generate-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post()
    @Roles('Admin')
    async generateReport(
        @Body() generateReportDto: GenerateReportDto,
        @CurrentUser() user: any,
    ) {
        return this.reportService.generateReport(generateReportDto, user.userId);
    }

    @Get()
    @Roles('Admin')
    async getAllReports(@Query('type') type?: string) {
        if (type) {
            return this.reportService.getReportsByType(type);
        }
        return this.reportService.getAllReports();
    }

    @Get(':id')
    @Roles('Admin')
    async getReportById(@Param('id') id: string) {
        return this.reportService.getReportById(id);
    }

    @Delete(':id')
    @Roles('Admin')
    async deleteReport(@Param('id') id: string) {
        return this.reportService.deleteReport(id);
    }
}
