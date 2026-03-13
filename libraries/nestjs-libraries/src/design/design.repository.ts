import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@postys/nestjs-libraries/database/prisma/prisma.service';

interface CreateDesignData {
  name?: string;
  templateId?: string;
  variables: Record<string, string>;
  renderedUrl?: string;
  width: number;
  height: number;
  userId: string;
  organizationId: string;
}

@Injectable()
export class DesignRepository {
  constructor(private _prisma: PrismaRepository<'design'>) {}

  async create(data: CreateDesignData) {
    return this._prisma.model.design.create({
      data: {
        name: data.name,
        templateId: data.templateId,
        variables: data.variables,
        renderedUrl: data.renderedUrl,
        width: data.width,
        height: data.height,
        userId: data.userId,
        organizationId: data.organizationId,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            platform: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this._prisma.model.design.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });
  }

  async findByOrganization(
    organizationId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [designs, total] = await Promise.all([
      this._prisma.model.design.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          renderedUrl: true,
          width: true,
          height: true,
          createdAt: true,
          template: {
            select: {
              id: true,
              name: true,
              category: true,
              platform: true,
            },
          },
        },
      }),
      this._prisma.model.design.count({ where: { organizationId } }),
    ]);

    return {
      designs,
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  }

  async updateRenderedUrl(id: string, renderedUrl: string) {
    return this._prisma.model.design.update({
      where: { id },
      data: { renderedUrl },
    });
  }

  async delete(id: string, organizationId: string) {
    return this._prisma.model.design.deleteMany({
      where: {
        id,
        organizationId,
      },
    });
  }
}
