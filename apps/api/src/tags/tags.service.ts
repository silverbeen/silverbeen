import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto';

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
    const existing = await this.prisma.tag.findUnique({
      where: { name: createTagDto.name },
    });

    if (existing) {
      throw new ConflictException('Tag already exists');
    }

    return this.prisma.tag.create({
      data: { name: createTagDto.name },
    });
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    await this.findById(id);

    const existing = await this.prisma.tag.findFirst({
      where: {
        name: updateTagDto.name,
        NOT: { id },
      },
    });

    if (existing) {
      throw new ConflictException('Tag already exists');
    }

    return this.prisma.tag.update({
      where: { id },
      data: { name: updateTagDto.name },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.tag.delete({
      where: { id },
    });
  }
}
