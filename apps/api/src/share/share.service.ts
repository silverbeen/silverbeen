import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShareLinkDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shareLink.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const link = await this.prisma.shareLink.findUnique({ where: { slug } });

    if (!link) throw new NotFoundException('Share link not found');
    if (!link.active) throw new NotFoundException('This link has been deactivated');
    if (link.expiresAt && new Date() > link.expiresAt) {
      throw new NotFoundException('This link has expired');
    }

    return link;
  }

  async create(dto: CreateShareLinkDto) {
    const slug = randomBytes(6).toString('base64url');

    return this.prisma.shareLink.create({
      data: {
        slug,
        type: dto.type,
        label: dto.label,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async toggleActive(id: string) {
    const link = await this.prisma.shareLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException('Share link not found');

    return this.prisma.shareLink.update({
      where: { id },
      data: { active: !link.active },
    });
  }

  async delete(id: string) {
    const link = await this.prisma.shareLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException('Share link not found');

    return this.prisma.shareLink.delete({ where: { id } });
  }

  async incrementView(slug: string) {
    return this.prisma.shareLink.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });
  }
}
