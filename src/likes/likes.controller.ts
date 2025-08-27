import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from '../posts/posts.service';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(
    private readonly likesService: LikesService,
    private readonly postsService: PostsService,
  ) {}

  @Post('posts/:postId')
  async likePost(@Param('postId') postId: string, @Request() req) {
    const post = await this.postsService.findOne(postId, req.user);
    return this.likesService.create(req.user, post);
  }

  @Delete('posts/:postId')
  async unlikePost(@Param('postId') postId: string, @Request() req) {
    const post = await this.postsService.findOne(postId, req.user);
    return this.likesService.remove(req.user, post);
  }

  @Get('my-likes')
  async getMyLikes(@Request() req) {
    return this.likesService.findByUser(req.user);
  }

  @Get('posts/:postId')
  async getPostLikes(@Param('postId') postId: string, @Request() req) {
    const post = await this.postsService.findOne(postId, req.user);
    return this.likesService.findByPost(post);
  }

  @Get('posts/:postId/check')
  async checkIfLiked(@Param('postId') postId: string, @Request() req) {
    const post = await this.postsService.findOne(postId, req.user);
    return this.likesService.checkIfLiked(req.user, post);
  }
} 