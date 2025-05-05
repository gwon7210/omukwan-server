import { Controller, Post, Get, Body, UseGuards, Request, Query, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @Body() createPostDto: {
      title?: string;
      content: string;
      post_type: string;
    },
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.postsService.create({
      ...createPostDto,
      image_url: imageUrl,
      user: req.user,
    });
  }
} 