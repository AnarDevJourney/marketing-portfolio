import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesAdminController } from './admin.controller.js';
import {
  ContactMessage,
  ContactMessageSchema,
} from './contact-message.schema.js';
import { ContactNotifier } from './contact-notifier.js';
import { ContactService } from './contact.service.js';
import { ContactPublicController } from './public.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactMessage.name, schema: ContactMessageSchema },
    ]),
  ],
  controllers: [ContactPublicController, MessagesAdminController],
  providers: [ContactService, ContactNotifier],
})
export class ContactModule {}
