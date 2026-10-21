import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShareLinkDto } from './dto';
import { randomBytes } from 'crypto';
import { isPrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  private async findLinkByIdOrThrow(id: string) {
    const link = await this.prisma.shareLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException('Share link not found');
    return link;
  }

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
    const link = await this.findLinkByIdOrThrow(id);

    return this.prisma.shareLink.update({
      where: { id },
      data: { active: !link.active },
    });
  }

  async delete(id: string) {
    await this.findLinkByIdOrThrow(id);

    return this.prisma.shareLink.delete({ where: { id } });
  }

  /**
   * 조회수 증가 (단일 원자적 update)
   * 비활성/만료 링크는 증가하지 않고 404
   */
  async incrementView(slug: string) {
    try {
      return await this.prisma.shareLink.update({
        where: {
          slug,
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        data: { viewCount: { increment: 1 } },
      });
    } catch (err) {
      if (isPrismaError(err, 'P2025')) {
        throw new NotFoundException('Share link not found');
      }
      throw err;
    }
  }
}
