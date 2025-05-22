import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
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
} 