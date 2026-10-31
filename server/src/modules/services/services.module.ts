import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesAdminController } from './admin.controller.js';
import { ServiceItem, ServiceItemSchema } from './service.schema.js';
import { ServicesPublicController } from './public.controller.js';
import { ServicesService } from './services.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceItem.name, schema: ServiceItemSchema },
    ]),
  ],
  controllers: [ServicesAdminController, ServicesPublicController],
  providers: [ServicesService],
})
export class ServicesModule {}
