import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SeriesService } from './series.service';
import { CreateSeriesDto, UpdateSeriesDto } from './dto';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async findAll() {
    return this.seriesService.findAll();
  }

  @Get(':idOrSlug')
  async findByIdOrSlug(@Param('idOrSlug') idOrSlug: string) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)) {
      return this.seriesService.findById(idOrSlug);
    }
    return this.seriesService.findBySlug(idOrSlug);
  }

  @Post()
  @UseGuards(SupabaseGuard, AdminGuard)
  async create(@Body() dto: CreateSeriesDto) {
    return this.seriesService.create(dto);
  }

  @Put(':id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateSeriesDto) {
    return this.seriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async delete(@Param('id') id: string) {
    return this.seriesService.delete(id);
  }

  @Put(':id/order')
  @UseGuards(SupabaseGuard, AdminGuard)
  async updatePostOrder(@Param('id') id: string, @Body('postIds') postIds: number[]) {
    return this.seriesService.updatePostOrder(id, postIds);
  }
}
