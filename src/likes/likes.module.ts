import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from '../entities/like.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like]),
    PostsModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {} 