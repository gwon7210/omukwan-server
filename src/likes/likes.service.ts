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
    // user.nickname이 없으면 DB에서 다시 조회
    if (!user.nickname) {
      const userRepository = this.likesRepository.manager.getRepository(User);
      const foundUser = await userRepository.findOne({ where: { id: user.id } });
      if (!foundUser) {
        throw new NotFoundException('유저 정보를 찾을 수 없습니다.');
      }
      user = foundUser;
    }
    const like = this.likesRepository.create({ user, post });
    const savedLike = await this.likesRepository.save(like);

    console.log('user:', user);
    console.log('user.nickname:', user.nickname);
  
    // 자신의 게시물에 좋아요를 누른 경우 알림을 생성하지 않음
    if (post.user.id !== user.id) {
      // 이미 해당 게시물에 대한 좋아요 알림이 있는지 확인
      const existingNotification = await this.notificationsService.findByTypeAndRelatedId(
        post.user.id,
        'like',
        post.id
      );

      // 기존 알림이 없을 때만 새로운 알림 생성
      if (!existingNotification) {
        await this.notificationsService.create(
          post.user,
          'like',
          `${user.nickname}님이 회원님의 게시물을 좋아합니다.`,
          post.id
        );
      }
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