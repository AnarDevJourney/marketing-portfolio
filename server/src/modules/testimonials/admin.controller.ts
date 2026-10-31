import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ReorderItemDto } from '../../common/dto/reorder.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto.js';
import { TestimonialsService } from './testimonials.service.js';

@ApiTags('admin / testimonials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/testimonials')
export class TestimonialsAdminController {
  constructor(private readonly testimonials: TestimonialsService) {}

  @Get()
  findAll() {
    return this.testimonials.findAll();
  }

  // Declared before ':id' routes so "reorder" isn't parsed as an id.
  @Patch('reorder')
  @ApiBody({ type: [ReorderItemDto] })
  reorder(
    @Body(
      new ParseArrayPipe({
        items: ReorderItemDto,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    items: ReorderItemDto[],
  ) {
    return this.testimonials.reorder(items);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.testimonials.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTestimonialDto) {
    return this.testimonials.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateTestimonialDto,
  ) {
    return this.testimonials.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.testimonials.remove(id);
  }
}
