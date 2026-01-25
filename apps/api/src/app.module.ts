import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { ResumeModule } from './resume';
import { PortfolioModule } from './portfolio';
import { AuthModule } from './auth';
import { PostsModule } from './posts';
import { TagsModule } from './tags';
import { UsersModule } from './users';

@Module({
  imports: [
    PrismaModule,
    ResumeModule,
    PortfolioModule,
    AuthModule,
    PostsModule,
    TagsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
