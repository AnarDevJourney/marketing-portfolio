import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { Env } from '../../config/env.js';
import { ContactMessage } from './contact-message.schema.js';

/** Emails the site owner about new messages when SMTP_URL and NOTIFY_EMAIL are set. */
@Injectable()
export class ContactNotifier {
  private readonly logger = new Logger(ContactNotifier.name);
  private readonly transport?: Transporter;
  private readonly to?: string;

  constructor(config: ConfigService<Env, true>) {
    const smtp = config.get('SMTP_URL', { infer: true });
    this.to = config.get('NOTIFY_EMAIL', { infer: true });
    if (smtp && this.to) this.transport = createTransport(smtp);
  }

  /** Fire-and-forget: a mail failure must never fail the form submission. */
  notify(msg: ContactMessage) {
    if (!this.transport) return;
    this.transport
      .sendMail({
        to: this.to,
        replyTo: msg.email,
        subject: `New message from ${msg.name}${msg.subject ? `: ${msg.subject}` : ''}`,
        text: [
          `Name: ${msg.name}`,
          `Email: ${msg.email}`,
          msg.phone && `Phone: ${msg.phone}`,
          `Language: ${msg.locale}`,
          '',
          msg.message,
        ]
          .filter((l) => l !== undefined)
          .join('\n'),
      })
      .catch((err: Error) =>
        this.logger.warn(`Could not send notification: ${err.message}`),
      );
  }
}
