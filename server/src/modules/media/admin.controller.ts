import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { ListMediaDto } from './dto/list-media.dto.js';
import { UpdateMediaDto } from './dto/update-media.dto.js';
import { MAX_FILES_PER_UPLOAD, MAX_UPLOAD_SIZE } from './media.constants.js';
import { MediaService } from './media.service.js';

@ApiTags('admin / media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/media')
export class MediaAdminController {
  constructor(private readonly media: MediaService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES_PER_UPLOAD, {
      limits: { fileSize: MAX_UPLOAD_SIZE },
    }),
  )
  upload(@UploadedFiles() files: Express.Multer.File[] = []) {
    return this.media.upload(files);
  }

  @Get()
  list(@Query() query: ListMediaDto) {
    return this.media.list(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.media.findOne(id);
  }

  @Get(':id/usage')
  usage(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.media.findUsage(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateMediaDto,
  ) {
    return this.media.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.media.remove(id);
  }
}
