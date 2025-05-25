import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { GroupInvite } from '../entities/group-invite.entity';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { In, Between } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(GroupInvite)
    private groupInviteRepository: Repository<GroupInvite>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
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

  async getGroupMembers(groupId: string): Promise<{
    user: Pick<User, 'id' | 'nickname' | 'profile_image_url'>;
    joined_at: Date;
    is_creator: boolean;
  }[]> {
    // 그룹 존재 여부 확인
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['creator'],
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
        'groupMember.joined_at',
        'user.id',
        'user.nickname',
        'user.profile_image_url'
      ])
      .orderBy('groupMember.joined_at', 'ASC')
      .getMany();

    return groupMembers.map(member => ({
      user: member.user,
      joined_at: member.joined_at,
      is_creator: group.creator ? member.user.id === group.creator.id : false
    }));
  }

  async create(createGroupDto: CreateGroupDto, creator: User): Promise<Group> {
    // 그룹 생성
    const group = this.groupRepository.create({
      ...createGroupDto,
      creator: creator
    });
    const savedGroup = await this.groupRepository.save(group);

    // 생성자를 그룹 멤버로 추가
    const groupMember = this.groupMemberRepository.create({
      group: savedGroup,
      user: creator
    });
    await this.groupMemberRepository.save(groupMember);

    return savedGroup;
  }

  async inviteUser(groupId: string, inviterId: string, phoneNumber: string): Promise<void> {
    // 그룹 존재 여부 확인
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['creator'],
    });

    if (!group) {
      throw new NotFoundException('그룹을 찾을 수 없습니다.');
    }

    // 초대하는 사람이 그룹의 멤버인지 확인
    const inviter = await this.groupMemberRepository.findOne({
      where: {
        group: { id: groupId },
        user: { id: inviterId }
      }
    });

    if (!inviter) {
      throw new BadRequestException('그룹 멤버만 초대할 수 있습니다.');
    }

    // 이미 초대된 전화번호인지 확인
    const existingInvite = await this.groupInviteRepository.findOne({
      where: {
        group: { id: groupId },
        phone_number: phoneNumber,
        status: 'pending'
      }
    });

    if (existingInvite) {
      throw new BadRequestException('이미 초대된 전화번호입니다.');
    }

    // 초대 정보 저장
    const invite = this.groupInviteRepository.create({
      group,
      inviter: { id: inviterId },
      phone_number: phoneNumber,
      status: 'pending'
    });
    const savedInvite = await this.groupInviteRepository.save(invite);

    // 해당 전화번호로 가입된 유저가 있는지 확인
    const invitedUser = await this.userRepository.findOne({
      where: { phone_number: phoneNumber }
    });

    if (invitedUser) {
      // 알림 생성
      const inviterUser = await this.userRepository.findOne({
        where: { id: inviterId }
      });

      if (!inviterUser) {
        throw new NotFoundException('초대자를 찾을 수 없습니다.');
      }

      await this.notificationsService.create(
        invitedUser,
        'group_invite',
        `${inviterUser.nickname}님이 '${group.title}'에 초대했어요!`,
        savedInvite.id
      );
    }
  }

  async acceptInvite(inviteId: string, userId: string): Promise<void> {
    // 초대 정보 조회
    const invite = await this.groupInviteRepository.findOne({
      where: { id: inviteId },
      relations: ['group']
    });

    if (!invite) {
      throw new NotFoundException('초대 정보를 찾을 수 없습니다.');
    }

    // 초대된 전화번호와 유저의 전화번호가 일치하는지 확인
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user || user.phone_number !== invite.phone_number) {
      throw new BadRequestException('초대된 전화번호와 일치하지 않습니다.');
    }

    // 이미 수락된 초대인지 확인
    if (invite.status === 'accepted') {
      throw new BadRequestException('이미 수락된 초대입니다.');
    }

    // 이미 거절된 초대인지 확인
    if (invite.status === 'declined') {
      throw new BadRequestException('이미 거절된 초대입니다.');
    }

    // 초대 상태를 'accepted'로 변경
    invite.status = 'accepted';
    await this.groupInviteRepository.save(invite);

    // 이미 그룹 멤버인지 확인
    const existingMember = await this.groupMemberRepository.findOne({
      where: {
        group: { id: invite.group.id },
        user: { id: userId }
      }
    });

    if (!existingMember) {
      // 그룹 멤버로 추가
      const groupMember = this.groupMemberRepository.create({
        group: invite.group,
        user: { id: userId }
      });
      await this.groupMemberRepository.save(groupMember);
    }

    // 관련 알림 읽음 처리
    const notification = await this.notificationsService.findByTypeAndRelatedId(
      userId,
      'group_invite',
      inviteId
    );
    if (notification) {
      await this.notificationsService.markAsRead(notification.id, userId);
    }
  }

  async declineInvite(inviteId: string, userId: string): Promise<void> {
    // 초대 정보 조회
    const invite = await this.groupInviteRepository.findOne({
      where: { id: inviteId }
    });

    if (!invite) {
      throw new NotFoundException('초대 정보를 찾을 수 없습니다.');
    }

    // 초대된 전화번호와 유저의 전화번호가 일치하는지 확인
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user || user.phone_number !== invite.phone_number) {
      throw new BadRequestException('초대된 전화번호와 일치하지 않습니다.');
    }

    // 이미 수락된 초대인지 확인
    if (invite.status === 'accepted') {
      throw new BadRequestException('이미 수락된 초대입니다.');
    }

    // 이미 거절된 초대인지 확인
    if (invite.status === 'declined') {
      throw new BadRequestException('이미 거절된 초대입니다.');
    }

    // 초대 상태를 'declined'로 변경
    invite.status = 'declined';
    await this.groupInviteRepository.save(invite);

    // 관련 알림 읽음 처리
    const notification = await this.notificationsService.findByTypeAndRelatedId(
      userId,
      'group_invite',
      inviteId
    );
    if (notification) {
      await this.notificationsService.markAsRead(notification.id, userId);
    }
  }
} 