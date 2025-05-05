import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(limit: number = 10, postType?: string, cursor?: Date) {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .orderBy('post.created_at', 'DESC')
      .take(limit + 1); // 다음 페이지 존재 여부 확인을 위해 limit + 1개 조회

    if (postType) {
      queryBuilder.where('post.post_type = :postType', { postType });
    }

    if (cursor) {
      queryBuilder.andWhere('post.created_at < :cursor', { cursor });
    }

    const posts = await queryBuilder.getMany();
    const hasNextPage = posts.length > limit;
    const items = hasNextPage ? posts.slice(0, -1) : posts;
    const nextCursor = hasNextPage ? items[items.length - 1].created_at : null;

    return {
      posts: items,
      meta: {
        hasNextPage,
        nextCursor,
        limit,
      },
    };
  }

  async create(createPostDto: {
    title?: string;
    content: string;
    image_url?: string;
    post_type: string;
    user: User;
  }): Promise<Post> {
    const post = this.postsRepository.create(createPostDto);
    return await this.postsRepository.save(post);
  }
} 