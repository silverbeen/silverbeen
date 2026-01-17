import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { ResumeModule } from './resume';

@Module({
  imports: [PrismaModule, ResumeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
