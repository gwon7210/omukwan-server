import { DataSource } from 'typeorm';
import { Group } from '../entities/group.entity';

export const groupSeed = async (dataSource: DataSource) => {
  const groupRepository = dataSource.getRepository(Group);

  // 기존 그룹 삭제
  await groupRepository.delete({});

  const groups = [
    {
      title: '서울 오목관 모임',
      description: '서울 지역 오목관을 찾는 사람들의 모임입니다.',
      memberCount: 15,
      todayOmukwanCount: 3,
    },
    {
      title: '부산 오목 동호회',
      description: '부산에서 오목을 즐기는 사람들의 모임입니다.',
      memberCount: 8,
      todayOmukwanCount: 1,
    },
    {
      title: '대구 오목 클럽',
      description: '대구 지역 오목 애호가들의 모임입니다.',
      memberCount: 12,
      todayOmukwanCount: 2,
    },
    {
      title: '인천 오목 연구회',
      description: '인천에서 오목을 연구하고 즐기는 모임입니다.',
      memberCount: 10,
      todayOmukwanCount: 0,
    },
    {
      title: '대전 오목 동아리',
      description: '대전 지역 오목 동아리입니다.',
      memberCount: 6,
      todayOmukwanCount: 1,
    },
  ];

  for (const group of groups) {
    await groupRepository.save(group);
  }
}; 