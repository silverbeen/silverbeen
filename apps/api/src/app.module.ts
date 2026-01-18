import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { ResumeModule } from './resume';
import { AuthModule } from './auth';
import { PostsModule } from './posts';
import { TagsModule } from './tags';

@Module({
  imports: [PrismaModule, ResumeModule, AuthModule, PostsModule, TagsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
