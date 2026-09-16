import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case.js';
import { GetAccountUseCase } from '../../application/use-cases/get-account.use-case.js';
import { ListAccountsUseCase } from '../../application/use-cases/list-accounts.use-case.js';
import { AccountHttpMapper } from './account-http.mapper.js';
import { AccountExceptionFilter } from './account-exception.filter.js';
import { CreateAccountDto } from './dto/create-account.dto.js';

@Controller()
@UseFilters(AccountExceptionFilter)
export class AccountController {
  constructor(
    private readonly createAccount: CreateAccountUseCase,
    private readonly getAccount: GetAccountUseCase,
    private readonly listAccounts: ListAccountsUseCase,
  ) {}

  @Post('accounts')
  async create(@Body() body: CreateAccountDto) {
    const account = await this.createAccount.execute(body);
    return AccountHttpMapper.toResponse(account);
  }

  @Get('organizations/:organizationId/accounts')
  async list(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
  ) {
    const accounts = await this.listAccounts.execute(organizationId);
    return accounts.map((account) => AccountHttpMapper.toResponse(account));
  }

  @Get('organizations/:organizationId/accounts/:accountId')
  async get(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
    @Param('accountId', new ParseUUIDPipe({ version: '4' }))
    accountId: string,
  ) {
    const account = await this.getAccount.execute(organizationId, accountId);
    return AccountHttpMapper.toResponse(account);
  }
}
