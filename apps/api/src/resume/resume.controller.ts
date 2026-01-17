import { Controller, Get, Put, Body } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { UpdateResumeDto } from './dto';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  async getResume() {
    return this.resumeService.getResume();
  }

  @Put()
  async updateResume(@Body() updateResumeDto: UpdateResumeDto) {
    return this.resumeService.updateResume(updateResumeDto.content);
  }
}
