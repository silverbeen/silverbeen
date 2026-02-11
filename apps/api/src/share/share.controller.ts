import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ShareService } from './share.service';
import { CreateShareLinkDto } from './dto';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Get()
  @UseGuards(SupabaseGuard, AdminGuard)
  async findAll() {
    return this.shareService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.shareService.findBySlug(slug);
  }

  @Post()
  @UseGuards(SupabaseGuard, AdminGuard)
  async create(@Body() dto: CreateShareLinkDto) {
    return this.shareService.create(dto);
  }

  @Patch(':id/toggle')
  @UseGuards(SupabaseGuard, AdminGuard)
  async toggleActive(@Param('id') id: string) {
    return this.shareService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async delete(@Param('id') id: string) {
    return this.shareService.delete(id);
  }

  @Post(':slug/view')
  async incrementView(@Param('slug') slug: string) {
    return this.shareService.incrementView(slug);
  }
}
