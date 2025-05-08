import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    private notificationsService: NotificationsService,
  ) {}

  async create(user: User, post: Post): Promise<Like> {
    const like = this.likesRepository.create({ user, post });
    const savedLike = await this.likesRepository.save(like);

    // 자신의 게시물에 좋아요를 누른 경우 알림을 생성하지 않음
    if (post.user.id !== user.id) {
      await this.notificationsService.create(
        post.user,
        'like',
        `${user.nickname}님이 회원님의 게시물을 좋아합니다.`,
        post.id
      );
    }

    return savedLike;
  }

  async remove(user: User, post: Post): Promise<void> {
    const result = await this.likesRepository.delete({ user, post });
    if (result.affected === 0) {
      throw new NotFoundException('좋아요를 찾을 수 없습니다.');
    }
  }

  async findByUser(user: User): Promise<Like[]> {
    return await this.likesRepository.find({
      where: { user },
      relations: ['post', 'post.user'],
    });
  }

  async findByPost(post: Post): Promise<Like[]> {
    return await this.likesRepository.find({
      where: { post },
      relations: ['user'],
    });
  }

  async checkIfLiked(user: User, post: Post): Promise<boolean> {
    const like = await this.likesRepository.findOne({
      where: { user, post },
    });
    return !!like;
  }
} 