import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case.js';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserExceptionFilter } from './user-exception.filter.js';
import { UserHttpMapper } from './user-http.mapper.js';

@Controller()
@UseFilters(UserExceptionFilter)
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post('users')
  async create(@Body() body: CreateUserDto) {
    const user = await this.createUserUseCase.execute(body);

    return UserHttpMapper.toResponse(user);
  }

  @Get('organizations/:organizationId/users')
  async listByOrganization(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
  ) {
    const users = await this.listUsersUseCase.execute(organizationId);

    return users.map((user) => UserHttpMapper.toResponse(user));
  }
}
