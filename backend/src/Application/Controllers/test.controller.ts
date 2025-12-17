import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { ReportService } from '../Services/report.service';

// NOTE: This controller is intended for test environments only. It is enabled when
// process.env.ENABLE_TEST_ENDPOINTS === 'true'. Do NOT enable in production.

@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly reportService: ReportService,
  ) {}

  @Post('seed')
  async seed(@Body() body: any) {
    if (process.env.ENABLE_TEST_ENDPOINTS !== 'true') {
      this.logger.warn('Test endpoints disabled');
      return { status: 'disabled' };
    }

    // create admin user if requested
    if (body?.admin) {
      try {
        await this.authService.register({
          email: 'admin@example.com',
          name: 'E2E Admin',
          password: 'password',
          role: 'admin',
        } as any);
      } catch (err) {
        this.logger.warn('register may have thrown (user may already exist)');
      }
    }

    // create a sample report
    try {
      await this.reportService.generateReport({
        reportType: 'Sales',
        startDate: '2025-11-01',
        endDate: '2025-11-30',
      }, 'seed-user');
    } catch (err) {
      this.logger.warn('report generation in seed failed', err as any);
    }

    return { status: 'ok' };
  }
}
