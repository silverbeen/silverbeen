import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async findAll() {
    return this.tagsService.findAll();
  }

  @Post()
  @UseGuards(SupabaseGuard, AdminGuard)
  async create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async delete(@Param('id') id: string) {
    return this.tagsService.delete(id);
  }
}
