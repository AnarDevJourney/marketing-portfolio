import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module.js';
import { TestimonialsAdminController } from './admin.controller.js';
import { Testimonial, TestimonialSchema } from './testimonial.schema.js';
import { TestimonialsPublicController } from './public.controller.js';
import { TestimonialsService } from './testimonials.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Testimonial.name, schema: TestimonialSchema },
    ]),
    MediaModule,
  ],
  controllers: [TestimonialsAdminController, TestimonialsPublicController],
  providers: [TestimonialsService],
})
export class TestimonialsModule {}
