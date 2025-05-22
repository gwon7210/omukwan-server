import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';
import { groupSeed } from './group.seed';
import { createPostSeed } from './post.seed';
import { createUserSeed } from './user.seed';
import { groupMemberSeed } from './group-member.seed';
import { GroupMember } from '../entities/group-member.entity';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';

const dataSource = new DataSource(databaseConfig as any);

async function runSeed() {
  try {
    await dataSource.initialize();
    console.log('데이터베이스 연결 성공');

    // 그룹 멤버 시드 데이터 삭제
    const groupMemberRepository = dataSource.getRepository(GroupMember);
    await groupMemberRepository.delete({});
    const remainingGroupMembers = await groupMemberRepository.count();
    if (remainingGroupMembers > 0) {
      throw new Error(`그룹 멤버 데이터가 ${remainingGroupMembers}개 남아있습니다.`);
    }
    console.log('그룹 멤버 데이터 삭제 완료');

    // 그룹 시드 데이터 삭제
    const groupRepository = dataSource.getRepository(Group);
    await groupRepository.delete({});
    const remainingGroups = await groupRepository.count();
    if (remainingGroups > 0) {
      throw new Error(`그룹 데이터가 ${remainingGroups}개 남아있습니다.`);
    }
    console.log('그룹 데이터 삭제 완료');

    // 사용자 시드 데이터 삭제
    const userRepository = dataSource.getRepository(User);
    await userRepository.delete({});
    const remainingUsers = await userRepository.count();
    if (remainingUsers > 0) {
      throw new Error(`사용자 데이터가 ${remainingUsers}개 남아있습니다.`);
    }
    console.log('사용자 데이터 삭제 완료');

    // 사용자 시드 데이터 실행
    await createUserSeed(dataSource);
    console.log('사용자 시드 데이터 생성 완료');

    // 그룹 시드 데이터 실행
    await groupSeed(dataSource);
    console.log('그룹 시드 데이터 생성 완료');

    // 그룹 멤버 시드 데이터 실행
    await groupMemberSeed(dataSource);
    console.log('그룹 멤버 시드 데이터 생성 완료');

    // 게시물 시드 데이터 실행
    await createPostSeed(dataSource);
    console.log('게시물 시드 데이터 생성 완료');

    await dataSource.destroy();
    console.log('데이터베이스 연결 종료');
  } catch (error) {
    console.error('시드 데이터 생성 중 오류 발생:', error);
    process.exit(1);
  }
}

runSeed(); 