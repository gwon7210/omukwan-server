import { Controller, Post, Get, Body, UseGuards, Request, Query, ParseIntPipe, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
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
    @Request() req,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('post_type') postType?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedCursor = cursor ? new Date(cursor) : undefined;
    return this.postsService.findAll(limit, postType, parsedCursor, req.user);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(
    @Request() req,
    @Query('keyword') keyword: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('cursor') cursor?: string,
  ) {
    const parsedCursor = cursor ? new Date(cursor) : undefined;
    return this.postsService.search(keyword, limit, parsedCursor, req.user);
  }

  @Get('my-omokwan-count-by-month')
  @UseGuards(JwtAuthGuard)
  async getMyOmokwanCountByMonth(
    @Request() req,
    @Query('year', new ParseIntPipe()) year: number,
    @Query('month', new ParseIntPipe()) month: number,
  ) {
    return this.postsService.getMyOmokwanCountByMonth(req.user.id, year, month);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.postsService.findOne(id, req.user);
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
    @Request() req,
    @Body() createPostDto: {
      title?: string;
      content: string;
      post_type: string;
      visibility?: 'public' | 'group' | 'private';
      group_id?: string;
    },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.postsService.create({
      ...createPostDto,
      image_url: imageUrl,
      user: req.user,
    });
  }
} 