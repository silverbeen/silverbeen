import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { ResumeModule } from './resume';
import { AuthModule } from './auth';

@Module({
  imports: [PrismaModule, ResumeModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
