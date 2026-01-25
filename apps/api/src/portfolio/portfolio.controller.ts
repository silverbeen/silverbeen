import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { UpdatePortfolioDto } from './dto';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async getPortfolio() {
    return this.portfolioService.getPortfolio();
  }

  @Put()
  @UseGuards(SupabaseGuard, AdminGuard)
  async updatePortfolio(@Body() updatePortfolioDto: UpdatePortfolioDto) {
    return this.portfolioService.updatePortfolio(updatePortfolioDto.content);
  }
}
