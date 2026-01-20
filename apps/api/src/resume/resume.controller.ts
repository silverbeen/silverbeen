import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { UpdateResumeDto } from './dto';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  async getResume() {
    return this.resumeService.getResume();
  }

  @Put()
  @UseGuards(SupabaseGuard, AdminGuard)
  async updateResume(@Body() updateResumeDto: UpdateResumeDto) {
    return this.resumeService.updateResume(updateResumeDto.content);
  }
}
