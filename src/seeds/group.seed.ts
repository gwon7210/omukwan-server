import { DataSource } from 'typeorm';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';

export const groupSeed = async (dataSource: DataSource) => {
  const groupRepository = dataSource.getRepository(Group);
  const userRepository = dataSource.getRepository(User);

  // 기존 그룹 삭제
  await groupRepository.delete({});

  // 첫 번째 사용자를 가져와서 creator로 사용
  const creator = await userRepository.findOne({
    where: {},
    order: { created_at: 'ASC' }
  });

  if (!creator) {
    console.log('사용자가 없어 그룹을 생성할 수 없습니다.');
    return;
  }

  const groups = [
    {
      title: '서울 오목관 모임',
      description: '서울 지역 오목관을 찾는 사람들의 모임입니다.',
      creator: creator
    },
    {
      title: '부산 오목 동호회',
      description: '부산에서 오목을 즐기는 사람들의 모임입니다.',
      creator: creator
    },
    {
      title: '대구 오목 클럽',
      description: '대구 지역 오목 애호가들의 모임입니다.',
      creator: creator
    },
    {
      title: '인천 오목 연구회',
      description: '인천에서 오목을 연구하고 즐기는 모임입니다.',
      creator: creator
    },
    {
      title: '대전 오목 동아리',
      description: '대전 지역 오목 동아리입니다.',
      creator: creator
    },
  ];

  for (const group of groups) {
    await groupRepository.save(group);
  }
}; 