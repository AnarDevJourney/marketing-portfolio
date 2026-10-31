import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { ContactMessage } from '../contact/contact-message.schema.js';
import { Media } from '../media/media.schema.js';
import { Project } from '../projects/project.schema.js';

/** Dashboard numbers for the admin panel. */
@ApiTags('admin / stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/stats')
export class StatsController {
  constructor(
    @InjectModel(ContactMessage.name)
    private readonly messages: Model<ContactMessage>,
    @InjectModel(Project.name) private readonly projects: Model<Project>,
    @InjectModel(Media.name) private readonly media: Model<Media>,
  ) {}

  @Get()
  async get() {
    const [unreadMessages, totalProjects, publishedProjects, [media]] =
      await Promise.all([
        this.messages.countDocuments({ read: false }),
        this.projects.countDocuments(),
        this.projects.countDocuments({ published: true }),
        this.media.aggregate<{ count: number; totalSize: number }>([
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              totalSize: { $sum: '$size' },
            },
          },
        ]),
      ]);
    return {
      unreadMessages,
      projects: { total: totalProjects, published: publishedProjects },
      media: { count: media?.count ?? 0, totalSize: media?.totalSize ?? 0 },
    };
  }
}
