import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';

export const createUserSeed = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  const users = [
    {
      nickname: '김교회',
      church_name: '서울교회',
      faith_confession: '하나님을 사랑합니다',
      kakao_id: 'kakao_1',
      kakao_email: 'kim@example.com',
      is_approved: true,
    },
    {
      nickname: '이믿음',
      church_name: '부산교회',
      faith_confession: '예수님을 따르는 삶',
      kakao_id: 'kakao_2',
      kakao_email: 'lee@example.com',
      is_approved: true,
    },
    {
      nickname: '박성경',
      church_name: '인천교회',
      faith_confession: '말씀대로 살겠습니다',
      kakao_id: 'kakao_3',
      kakao_email: 'park@example.com',
      is_approved: true,
    },
    {
      nickname: '최기도',
      church_name: '대구교회',
      faith_confession: '기도하는 삶을 살겠습니다',
      kakao_id: 'kakao_4',
      kakao_email: 'choi@example.com',
      is_approved: true,
    },
    {
      nickname: '정찬양',
      church_name: '광주교회',
      faith_confession: '찬양으로 영광 돌리겠습니다',
      kakao_id: 'kakao_5',
      kakao_email: 'jung@example.com',
      is_approved: true,
    },
    {
      nickname: 'tester',
      church_name: 'tester 교회',
      faith_confession: 'test message',
      kakao_id: 'kakao_tester',
      kakao_email: 'tester@example.com',
      is_approved: true,
    },
  ];

  for (const user of users) {
    const newUser = userRepository.create(user);
    await userRepository.save(newUser);
  }
}; 