import { Controller, Get, Put, Body } from '@nestjs/common';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  async getResume() {
    return this.resumeService.getResume();
  }

  @Put()
  async updateResume(@Body() content: object) {
    return this.resumeService.updateResume(content);
  }
}
