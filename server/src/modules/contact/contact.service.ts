import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContactMessage } from './contact-message.schema.js';
import { ContactNotifier } from './contact-notifier.js';
import { CreateContactMessageDto } from './dto/create-contact-message.dto.js';
import { ListMessagesDto, UpdateMessageDto } from './dto/messages.dto.js';

/** Submissions faster than this after the form rendered are treated as bots. */
export const MIN_FILL_TIME_MS = 3000;

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectModel(ContactMessage.name)
    private readonly messages: Model<ContactMessage>,
    private readonly notifier: ContactNotifier,
  ) {}

  /** Stores a message. Spam (honeypot / too fast) is silently dropped so bots get no signal. */
  async submit(
    { website, startedAt, ...dto }: CreateContactMessageDto,
    meta: { ip?: string; userAgent?: string },
  ) {
    if (website || Date.now() - startedAt < MIN_FILL_TIME_MS) {
      this.logger.warn(`Dropped spam contact submission from ${meta.ip}`);
      return { ok: true };
    }
    const msg = await this.messages.create({ ...dto, ...meta });
    this.notifier.notify(msg);
    return { ok: true };
  }

  async list({ read, page, limit }: ListMessagesDto) {
    const filter = read === undefined ? {} : { read };
    const [items, total] = await Promise.all([
      this.messages
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.messages.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  }

  async update(id: Types.ObjectId, dto: UpdateMessageDto) {
    const msg = await this.messages
      .findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' })
      .lean();
    if (!msg) throw new NotFoundException('Message not found');
    return msg;
  }

  async remove(id: Types.ObjectId) {
    const res = await this.messages.deleteOne({ _id: id });
    if (!res.deletedCount) throw new NotFoundException('Message not found');
  }
}
