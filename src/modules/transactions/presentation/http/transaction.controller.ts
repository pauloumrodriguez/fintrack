import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case.js';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case.js';
import { ListTransactionsUseCase } from '../../application/use-cases/list-transactions.use-case.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { TransactionExceptionFilter } from './transaction-exception.filter.js';

@Controller()
@UseFilters(TransactionExceptionFilter)
export class TransactionController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
    private readonly listTransactions: ListTransactionsUseCase,
  ) {}

  @Post('transactions')
  create(@Body() body: CreateTransactionDto) {
    return this.createTransaction.execute(body);
  }

  @Get('organizations/:organizationId/transactions')
  list(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
  ) {
    return this.listTransactions.execute(organizationId);
  }

  @Get('organizations/:organizationId/transactions/:transactionId')
  get(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
    @Param('transactionId', new ParseUUIDPipe({ version: '4' }))
    transactionId: string,
  ) {
    return this.getTransaction.execute(organizationId, transactionId);
  }
}
