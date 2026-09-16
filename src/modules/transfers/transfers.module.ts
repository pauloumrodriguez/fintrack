import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferController } from './transfer.controller.js';
import { TransferOrmEntity } from './transfer.orm-entity.js';
import { TransferService } from './transfer.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TransferOrmEntity])],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransfersModule {}
