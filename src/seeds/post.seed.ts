import { DataSource } from 'typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';

export const createPostSeed = async (dataSource: DataSource) => {
  const postRepository = dataSource.getRepository(Post);
  const userRepository = dataSource.getRepository(User);

  // 모든 사용자 가져오기
  const users = await userRepository.find();

  // 현재 시간에서 30분 전부터 시작
  const baseDate = new Date();
  baseDate.setMinutes(baseDate.getMinutes() - 30);

  const posts = [
    // 오묵완 타입 게시물 (6개)
    {
      title: '오늘의 오묵완',
      content: '하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라',
      post_type: '오묵완',
      user: users[0],
      created_at: new Date(baseDate.getTime() + 1 * 60000), // 1분
    },
    {
      content: '오늘도 하나님의 은혜로 하루를 시작합니다.',
      post_type: '오묵완',
      user: users[1],
      created_at: new Date(baseDate.getTime() + 2 * 60000), // 2분
    },
    {
      title: '오묵완 묵상',
      content: '여호와를 경외하는 것이 지식의 근본이니라',
      post_type: '오묵완',
      user: users[2],
      created_at: new Date(baseDate.getTime() + 3 * 60000), // 3분
    },
    {
      content: '하나님의 말씀은 내 발에 등이요 내 길에 빛이니이다',
      post_type: '오묵완',
      user: users[3],
      created_at: new Date(baseDate.getTime() + 4 * 60000), // 4분
    },
    {
      title: '오늘의 오묵완',
      content: '내가 네게 명령한 것이 아니냐 강하고 담대하라 두려워하지 말며 놀라지 말라 네 하나님 여호와가 네가 어디로 가든지 너와 함께 있느니라',
      post_type: '오묵완',
      user: users[4],
      created_at: new Date(baseDate.getTime() + 5 * 60000), // 5분
    },
    {
      content: '여호와는 나의 목자시니 내가 부족함이 없으리로다',
      post_type: '오묵완',
      user: users[0],
      created_at: new Date(baseDate.getTime() + 6 * 60000), // 6분
    },

    // 말씀나눔 타입 게시물 (6개)
    {
      title: '말씀 나눔',
      content: '오늘도 감사한 하루를 보내게 해주셔서 감사합니다. 내일도 하나님의 은혜로 살아가게 해주소서.',
      post_type: '말씀나눔',
      user: users[1],
      created_at: new Date(baseDate.getTime() + 7 * 60000), // 7분
    },
    {
      content: '우리 교회를 위해 기도해주세요.',
      post_type: '말씀나눔',
      user: users[2],
      created_at: new Date(baseDate.getTime() + 8 * 60000), // 8분
    },
    {
      title: '말씀 묵상',
      content: '이웃의 아픔을 함께 나누며 기도합니다.',
      post_type: '말씀나눔',
      user: users[3],
      created_at: new Date(baseDate.getTime() + 9 * 60000), // 9분
    },
    {
      content: '새로운 성도들을 위해 기도합니다.',
      post_type: '말씀나눔',
      user: users[4],
      created_at: new Date(baseDate.getTime() + 10 * 60000), // 10분
    },
    {
      title: '말씀 나눔',
      content: '하나님의 은혜로 건강하게 지내고 있습니다. 감사합니다.',
      post_type: '말씀나눔',
      user: users[0],
      created_at: new Date(baseDate.getTime() + 11 * 60000), // 11분
    },
    {
      content: '우리 가정을 위해 기도합니다.',
      post_type: '말씀나눔',
      user: users[1],
      created_at: new Date(baseDate.getTime() + 12 * 60000), // 12분
    },

    // 기도제목 타입 게시물 (6개)
    {
      title: '기도 제목',
      content: '오늘 예배에서 부른 찬양 "주님의 마음"이 너무 은혜로웠습니다.',
      post_type: '기도제목',
      user: users[2],
      created_at: new Date(baseDate.getTime() + 13 * 60000), // 13분
    },
    {
      content: '새로운 찬양을 배웠어요. 다음 주 예배에서 함께 부를 예정입니다.',
      post_type: '기도제목',
      user: users[3],
      created_at: new Date(baseDate.getTime() + 14 * 60000), // 14분
    },
    {
      title: '기도 나눔',
      content: '"주님의 사랑" 이 찬양이 너무 은혜로워요.',
      post_type: '기도제목',
      user: users[4],
      created_at: new Date(baseDate.getTime() + 15 * 60000), // 15분
    },
    {
      content: '오늘 청년부 예배에서 부른 찬양이 마음에 와닿았습니다.',
      post_type: '기도제목',
      user: users[0],
      created_at: new Date(baseDate.getTime() + 16 * 60000), // 16분
    },
    {
      title: '기도 제목',
      content: '"주님의 은혜로" 이 찬양의 가사가 마음에 깊이 남습니다.',
      post_type: '기도제목',
      user: users[1],
      created_at: new Date(baseDate.getTime() + 17 * 60000), // 17분
    },
    {
      content: '새로 나온 찬양 앨범을 추천합니다.',
      post_type: '기도제목',
      user: users[2],
      created_at: new Date(baseDate.getTime() + 18 * 60000), // 18분
    },

    // 고민 타입 게시물 (6개)
    {
      title: '고민 나눔',
      content: '요한복음 3장 16절을 읽으며 하나님의 크신 사랑을 다시 한번 깨닫게 되었습니다.',
      post_type: '고민',
      user: users[3],
      created_at: new Date(baseDate.getTime() + 19 * 60000), // 19분
    },
    {
      content: '로마서 8장을 읽으며 하나님의 약속을 깊이 묵상했습니다.',
      post_type: '고민',
      user: users[4],
      created_at: new Date(baseDate.getTime() + 20 * 60000), // 20분
    },
    {
      title: '고민 상담',
      content: '창세기 1장을 통해 하나님의 창조 섭리를 배웠습니다.',
      post_type: '고민',
      user: users[0],
      created_at: new Date(baseDate.getTime() + 21 * 60000), // 21분
    },
    {
      content: '시편 23편을 읽으며 하나님의 인도하심을 깨달았습니다.',
      post_type: '고민',
      user: users[1],
      created_at: new Date(baseDate.getTime() + 22 * 60000), // 22분
    },
    {
      title: '고민 나눔',
      content: '마태복음 5장의 산상수훈이 마음에 와닿았습니다.',
      post_type: '고민',
      user: users[2],
      created_at: new Date(baseDate.getTime() + 23 * 60000), // 23분
    },
    {
      content: '사도행전을 통해 초대교회의 모습을 배웠습니다.',
      post_type: '고민',
      user: users[3],
      created_at: new Date(baseDate.getTime() + 24 * 60000), // 24분
    },

    // 교회추천 타입 게시물 (6개)
    {
      title: '교회 추천',
      content: '이번 주 토요일 오후 2시에 청년부 봉사활동이 있습니다. 많은 참여 부탁드립니다.',
      post_type: '교회추천',
      user: users[4],
      created_at: new Date(baseDate.getTime() + 25 * 60000), // 25분
    },
    {
      content: '다음 주부터 새로운 성경공부가 시작됩니다.',
      post_type: '교회추천',
      user: users[0],
      created_at: new Date(baseDate.getTime() + 26 * 60000), // 26분
    },
    {
      title: '교회 소개',
      content: '이번 주 일요일 오후에 교회 봄맞이 행사가 있습니다.',
      post_type: '교회추천',
      user: users[1],
      created_at: new Date(baseDate.getTime() + 27 * 60000), // 27분
    },
    {
      content: '새로운 찬양팀이 구성되었습니다.',
      post_type: '교회추천',
      user: users[2],
      created_at: new Date(baseDate.getTime() + 28 * 60000), // 28분
    },
    {
      title: '교회 추천',
      content: '다음 달부터 새로운 예배 시간이 적용됩니다.',
      post_type: '교회추천',
      user: users[3],
      created_at: new Date(baseDate.getTime() + 29 * 60000), // 29분
    },
    {
      content: '교회 건물 리모델링이 시작됩니다.',
      post_type: '교회추천',
      user: users[4],
      created_at: new Date(baseDate.getTime() + 30 * 60000), // 30분
    },
  ];

  for (const post of posts) {
    // const newPost = postRepository.create(post);
    // await postRepository.save(newPost);
  }
}; 