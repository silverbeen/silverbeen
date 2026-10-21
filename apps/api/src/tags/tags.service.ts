import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto';
import { isPrismaError } from '../common/utils/prisma-error.util';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async findById(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async create(createTagDto: CreateTagDto) {
    try {
      return await this.prisma.tag.create({
        data: { name: createTagDto.name },
      });
    } catch (err) {
      throw this.toHttpError(err);
    }
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    try {
      return await this.prisma.tag.update({
        where: { id },
        data: { name: updateTagDto.name },
      });
    } catch (err) {
      throw this.toHttpError(err);
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.tag.delete({
        where: { id },
      });
    } catch (err) {
      throw this.toHttpError(err);
    }
  }

  /** name unique 제약 위반 → 409, 대상 없음 → 404 (웹에서 'already exists' 메시지 확인) */
  private toHttpError(err: unknown): unknown {
    if (isPrismaError(err, 'P2002')) return new ConflictException('Tag already exists');
    if (isPrismaError(err, 'P2025')) return new NotFoundException('Tag not found');
    return err;
  }
}
