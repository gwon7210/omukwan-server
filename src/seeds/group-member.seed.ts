import { DataSource } from 'typeorm';
import { GroupMember } from '../entities/group-member.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';

export const groupMemberSeed = async (dataSource: DataSource) => {
  const groupMemberRepository = dataSource.getRepository(GroupMember);
  const userRepository = dataSource.getRepository(User);
  const groupRepository = dataSource.getRepository(Group);

  // 기존 그룹 멤버 삭제
  await groupMemberRepository.delete({});

  // 모든 사용자와 그룹 가져오기
  const users = await userRepository.find();
  const groups = await groupRepository.find();

  if (!users.length || !groups.length) {
    console.log('사용자 또는 그룹이 없어 그룹 멤버를 생성할 수 없습니다.');
    return;
  }

  // 각 그룹에 랜덤하게 3-5명의 멤버 할당
  for (const group of groups) {
    const memberCount = Math.floor(Math.random() * 3) + 3; // 3-5명
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(memberCount, users.length); i++) {
      const user = shuffledUsers[i];
      const groupMember = groupMemberRepository.create({
        user: { id: user.id },
        group: { id: group.id },
      });
      // await groupMemberRepository.save(groupMember);
    }
  }
}; 