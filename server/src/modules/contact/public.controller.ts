import { Body, Controller, Headers, Ip, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service.js';
import { CreateContactMessageDto } from './dto/create-contact-message.dto.js';

@ApiTags('public')
@Controller('public/contact')
export class ContactPublicController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  submit(
    @Body() dto: CreateContactMessageDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.contact.submit(dto, {
      ip,
      userAgent: userAgent?.slice(0, 500),
    });
  }
}
