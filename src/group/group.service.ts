import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { In, Between } from 'typeorm';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async findAll(userId: string): Promise<Group[]> {
    // 사용자가 멤버로 있는 그룹만 조회
    const groupMembers = await this.groupMemberRepository.find({
      where: { user: { id: userId } },
      relations: ['group'],
    });

    const groups = groupMembers.map(gm => gm.group);
    
    // 각 그룹의 멤버 수를 실시간으로 계산
    const groupsWithMemberCount = await Promise.all(
      groups.map(async (group) => {
        const memberCount = await this.groupMemberRepository.count({
          where: { group: { id: group.id } }
        });
        return {
          ...group,
          memberCount
        };
      })
    );

    return groupsWithMemberCount;
  }

  async getTodayOmukwans(
    groupId: string, 
    date: string,
    userId: string
  ): Promise<{
    user: Pick<User, 'id' | 'nickname' | 'profile_image_url'>;
    posts: Post[];
  }> {
    // 그룹 존재 여부 확인
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다.');
    }

    // 유저가 그룹의 멤버인지 확인
    const groupMember = await this.groupMemberRepository
      .createQueryBuilder('groupMember')
      .leftJoinAndSelect('groupMember.user', 'user')
      .where('groupMember.group.id = :groupId', { groupId })
      .andWhere('groupMember.user.id = :userId', { userId })
      .select([
        'groupMember',
        'user.id',
        'user.nickname',
        'user.profile_image_url'
      ])
      .getOne();

    if (!groupMember) {
      throw new NotFoundException('해당 유저는 그룹의 멤버가 아닙니다.');
    }

    // 해당 날짜의 오묵완 게시물 조회
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const posts = await this.postRepository
      .createQueryBuilder('post')
      .where('post.user.id = :userId', { userId })
      .andWhere('post.post_type = :postType', { postType: '오묵완' })
      .andWhere('post.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('post.created_at', 'DESC')
      .getMany();

    return {
      user: groupMember.user,
      posts,
    };
  }

  async getTodayOmukwanStatus(groupId: string, date: string): Promise<{
    writtenMembers: Pick<User, 'id' | 'nickname' | 'profile_image_url'>[];
    notWrittenMembers: Pick<User, 'id' | 'nickname' | 'profile_image_url'>[];
  }> {
    // 그룹 존재 여부 확인
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다.');
    }

    // 그룹의 모든 멤버 조회
    const groupMembers = await this.groupMemberRepository
      .createQueryBuilder('groupMember')
      .leftJoinAndSelect('groupMember.user', 'user')
      .where('groupMember.group.id = :groupId', { groupId })
      .select([
        'groupMember',
        'user.id',
        'user.nickname',
        'user.profile_image_url'
      ])
      .getMany();

    const memberIds = groupMembers.map(gm => gm.user.id);

    // 해당 날짜의 오묵완 게시물 작성자 ID 조회
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const writtenPosts = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.user.id IN (:...memberIds)', { memberIds })
      .andWhere('post.post_type = :postType', { postType: '오묵완' })
      .andWhere('post.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .select(['post.id', 'user.id'])
      .getMany();

    const writtenUserIds = new Set(writtenPosts.map(post => post.user.id));

    // 작성자와 미작성자 분류
    const writtenMembers = groupMembers
      .map(gm => gm.user)
      .filter(user => writtenUserIds.has(user.id));

    const notWrittenMembers = groupMembers
      .map(gm => gm.user)
      .filter(user => !writtenUserIds.has(user.id));

    return {
      writtenMembers,
      notWrittenMembers,
    };
  }
} 