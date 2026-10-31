import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service.js';

@ApiTags('public')
@Controller('public/testimonials')
export class TestimonialsPublicController {
  constructor(private readonly testimonials: TestimonialsService) {}

  @Get()
  findAll() {
    return this.testimonials.findPublic();
  }
}
