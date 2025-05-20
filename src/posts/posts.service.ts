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

    // 비공개 게시물 제외
    queryBuilder.andWhere('post.is_private = false');

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

    // 비공개 게시물 접근 제한
    if (post.is_private && post.user.id !== currentUser?.id) {
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
    is_private?: boolean;
    user: User;
  }): Promise<Post> {
    const post = this.postsRepository.create(createPostDto);
    return await this.postsRepository.save(post);
  }

  async getMyOmokwanCountByMonth(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .where('post.userId = :userId', { userId })
      .andWhere('post.post_type = :type', { type: '오묵완' })
      .andWhere('post.created_at >= :startDate AND post.created_at < :endDate', { startDate, endDate })
      .orderBy('post.created_at', 'DESC')
      .getMany();

    return {
      count: posts.length,
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        mode: post.mode,
        content: post.mode === 'free' ? post.content : null,
        q1_answer: post.mode === 'template' ? post.q1_answer : null,
        q2_answer: post.mode === 'template' ? post.q2_answer : null,
        q3_answer: post.mode === 'template' ? post.q3_answer : null,
        is_private: post.is_private,
        created_at: new Date(post.created_at.getTime() + (9 * 60 * 60 * 1000)).toISOString(), // UTC+9 (KST)
      }))
    };
  }

  async search(keyword: string, limit: number = 10, cursor?: Date, currentUser?: User) {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .loadRelationCountAndMap('post.likes_count', 'post.likes')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      .where('(post.title ILIKE :keyword OR post.content ILIKE :keyword)', { keyword: `%${keyword}%` })
      .orderBy('post.created_at', 'DESC')
      .take(limit + 1);

    // 비공개 게시물 필터링 (소셜 페이지용)
    queryBuilder.andWhere('(post.is_private = false OR post.user.id = :userId)', {
      userId: currentUser?.id || '00000000-0000-0000-0000-000000000000'
    });

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

    // 각 게시글에 liked_by_me 필드 추가
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
} 