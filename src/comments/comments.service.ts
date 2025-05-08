import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private notificationsService: NotificationsService,
    private postsService: PostsService,
    private usersService: UsersService,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const user = await this.usersService.findOne(userId);
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      user,
    });
    const savedComment = await this.commentsRepository.save(comment);

    // 게시물 작성자에게 알림 전송
    const post = await this.postsService.findOne(createCommentDto.postId);
    if (post.user.id !== userId) {
      await this.notificationsService.create(
        post.user,
        'comment',
        `${user.nickname}님이 회원님의 게시물에 댓글을 남겼습니다.`,
        post.id
      );
    }

    // 부모 댓글이 있는 경우, 부모 댓글 작성자에게도 알림 전송
    if (createCommentDto.parentId) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: createCommentDto.parentId },
        relations: ['user'],
      });
      if (parentComment && parentComment.user.id !== userId) {
        await this.notificationsService.create(
          parentComment.user,
          'reply',
          `${user.nickname}님이 회원님의 댓글에 답글을 남겼습니다.`,
          post.id
        );
      }
    }

    return savedComment;
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    const comments = await this.commentsRepository.find({
      where: { postId },
      relations: ['user', 'parent'],
      order: {
        createdAt: 'ASC',
      },
    });

    // parent 댓글의 작성자 정보를 가져옵니다
    for (const comment of comments) {
      if (comment.parent) {
        const parentComment = await this.commentsRepository.findOne({
          where: { id: comment.parent.id },
          relations: ['user'],
        });
        if (parentComment) {
          comment.parent.user = parentComment.user;
        }
      }
    }

    return comments;
  }

  async remove(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.userId !== userId) {
      throw new UnauthorizedException('댓글을 삭제할 권한이 없습니다.');
    }

    await this.commentsRepository.remove(comment);
  }
} 