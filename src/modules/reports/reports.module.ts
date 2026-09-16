import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionOrmEntity } from '../transactions/infrastructure/database/typeorm/transaction.orm-entity.js';
import { MonthlyReportController } from './monthly-report.controller.js';
import { MonthlyReportService } from './monthly-report.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionOrmEntity])],
  controllers: [MonthlyReportController],
  providers: [MonthlyReportService],
})
export class ReportsModule {}
