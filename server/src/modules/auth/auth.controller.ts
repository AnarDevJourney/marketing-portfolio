import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  type AuthAdmin,
  CurrentAdmin,
} from '../../common/decorators/current-admin.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentAdmin() admin: AuthAdmin) {
    return this.auth.me(admin.id);
  }

  @Patch('password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentAdmin() admin: AuthAdmin,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.auth.changePassword(admin.id, dto);
  }
}
