import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module.js';
import { ClientsAdminController } from './admin.controller.js';
import { Client, ClientSchema } from './client.schema.js';
import { ClientsPublicController } from './public.controller.js';
import { ClientsService } from './clients.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
    MediaModule,
  ],
  controllers: [ClientsAdminController, ClientsPublicController],
  providers: [ClientsService],
})
export class ClientsModule {}
