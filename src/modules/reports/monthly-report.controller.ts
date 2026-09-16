import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { MonthlyReportService } from './monthly-report.service.js';

@Controller()
export class MonthlyReportController {
  constructor(private readonly report: MonthlyReportService) {}

  @Get('organizations/:organizationId/reports/monthly')
  get(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
    @Query('month') month: string,
  ) {
    return this.report.get(organizationId, month);
  }
}
