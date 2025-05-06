import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      userId,
    });
    return this.commentsRepository.save(comment);
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