import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { Like } from '../entities/like.entity';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async findAll(limit: number = 10, postType?: string, cursor?: Date, currentUser?: User) {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .loadRelationCountAndMap('post.likes_count', 'post.likes')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      .orderBy('post.created_at', 'DESC')
      .take(limit + 1);

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

    // 현재 사용자의 좋아요 여부 확인
    let likedPosts: string[] = [];
    if (currentUser?.id) {
      const likes = await this.likesRepository.find({
        where: { user: { id: currentUser.id } },
        relations: ['post'],
        select: {
          post: {
            id: true
          }
        }
      });
      likedPosts = likes.map(like => like.post.id);
    }

    // 각 게시글에 liked_by_me 필드 추가 (항상 boolean 값)
    const postsWithLikeStatus = items.map(post => {
      const { likes, ...postWithoutLikes } = post;
      return {
        ...postWithoutLikes,
        liked_by_me: Boolean(likedPosts.includes(post.id)),
      };
    });

    return {
      posts: postsWithLikeStatus,
      meta: {
        hasNextPage,
        nextCursor,
        limit,
      },
    };
  }

  async findOne(id: string, currentUser?: User): Promise<Post & { liked_by_me: boolean }> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user', 'likes'],
    });
    
    if (!post) {
      throw new NotFoundException(`게시물을 찾을 수 없습니다.`);
    }

    let liked_by_me = false;
    if (currentUser?.id) {
      const like = await this.likesRepository.findOne({
        where: { 
          user: { id: currentUser.id },
          post: { id: post.id }
        },
        relations: ['post'],
      });
      liked_by_me = Boolean(like);
    }

    return {
      ...post,
      liked_by_me,
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