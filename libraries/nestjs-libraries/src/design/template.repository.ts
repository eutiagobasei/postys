import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@postys/nestjs-libraries/database/prisma/prisma.service';
import { CreateTemplateDto } from '@postys/nestjs-libraries/dtos/design/design.dto';

@Injectable()
export class TemplateRepository {
  constructor(private _prisma: PrismaRepository<'designTemplate'>) {}

  async create(data: CreateTemplateDto, organizationId?: string) {
    return this._prisma.model.designTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        platform: data.platform,
        html: data.html,
        css: data.css,
        variables: data.variables as any,
        width: data.width,
        height: data.height,
        isPublic: data.isPublic ?? true,
        organizationId,
      },
    });
  }

  async findById(id: string) {
    return this._prisma.model.designTemplate.findUnique({
      where: { id },
    });
  }

  async findAll(options: {
    category?: string;
    platform?: string;
    organizationId?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, platform, organizationId, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        category ? { category } : {},
        platform ? { platform } : {},
        {
          OR: [
            { isPublic: true },
            organizationId ? { organizationId } : {},
          ],
        },
      ],
    };

    const [templates, total] = await Promise.all([
      this._prisma.model.designTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          platform: true,
          width: true,
          height: true,
          thumbnail: true,
          isPublic: true,
          variables: true,
          createdAt: true,
        },
      }),
      this._prisma.model.designTemplate.count({ where }),
    ]);

    return {
      templates,
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  }

  async findByPlatform(platform: string, organizationId?: string) {
    return this._prisma.model.designTemplate.findMany({
      where: {
        platform,
        OR: [
          { isPublic: true },
          organizationId ? { organizationId } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        platform: true,
        width: true,
        height: true,
        thumbnail: true,
        variables: true,
      },
    });
  }

  async updateThumbnail(id: string, thumbnailUrl: string) {
    return this._prisma.model.designTemplate.update({
      where: { id },
      data: { thumbnail: thumbnailUrl },
    });
  }

  async delete(id: string, organizationId: string) {
    return this._prisma.model.designTemplate.deleteMany({
      where: {
        id,
        organizationId,
      },
    });
  }
}
