import { Controller, Post, Get, Body, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('post_type') postType?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedCursor = cursor ? new Date(cursor) : undefined;
    return this.postsService.findAll(limit, postType, parsedCursor);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createPostDto: {
      title?: string;
      content: string;
      image_url?: string;
      post_type: string;
    },
    @Request() req,
  ) {
    return this.postsService.create({
      ...createPostDto,
      user: req.user,
    });
  }
} 