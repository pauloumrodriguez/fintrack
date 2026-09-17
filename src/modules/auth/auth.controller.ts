import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from './auth.decorators.js';
import { AuthService } from './auth.service.js';
import type { AuthRequest } from './auth-user.js';
import { LoginDto, RegisterDto } from './auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public()
  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }
  @Public()
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }
  @Get('me') me(@Req() request: AuthRequest) {
    return request.user;
  }
}
