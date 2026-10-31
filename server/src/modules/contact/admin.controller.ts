import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { ContactService } from './contact.service.js';
import { ListMessagesDto, UpdateMessageDto } from './dto/messages.dto.js';

@ApiTags('admin / messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/messages')
export class MessagesAdminController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  list(@Query() query: ListMessagesDto) {
    return this.contact.list(query);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.contact.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.contact.remove(id);
  }
}
