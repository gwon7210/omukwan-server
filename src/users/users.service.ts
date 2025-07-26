import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  private readonly adjectives = [
    '고요한', '아련한', '서늘한', '나른한', '은은한', '수줍은', '다정한', '덧없는', '청아한', '애틋한',
    '잔잔한', '흐릿한', '순한', '포근한', '투명한', '그리운', '고즈넉한', '다소곳한', '섬세한', '차분한',
    '사근사근한', '희미한', '느린', '적막한', '청량한', '말없는', '감미로운', '애상적인', '맑은', '평온한',
    '해맑은', '낡은', '낯선', '흐느끼는', '낙엽진', '새벽의', '아름다운', '빠른', '조용한', '튼튼한', '시원한',
    '따뜻한', '귀여운', '친절한', '스며든', '되뇌이는', '찬란한', '머뭇거리는', '다가서는', '속삭이는', '퍼져가는',
    '미끄러지는', '휘청이는', '휘돌아치는', '덤덤한', '어렴풋한', '깃든', '정적인', '느슨한', '바람결의', '불어오는',
    '뿌연', '되살아난', '떠도는', '소곤대는', '주황빛의', '서성이는', '메아리치는'
  ];

  private readonly nouns = [
    '샘물', '반석', '양떼', '포도나무', '감람나무', '무화과', '등불', '새벽별', '천막', '들꽃',
    '광야', '우물', '바위', '바다', '강물', '들판', '산', '시냇물', '나무', '무화과나무',
    '푸른 풀', '꽃', '바람', '햇빛', '비', '기름', '떡', '포도주', '옷자락', '성막',
    '언약궤', '돌판', '지팡이', '나팔', '제단', '문설주', '기둥', '떨기나무', '불기둥', '돌',
    '사막', '휘장', '방패', '왕관', '항아리', '사다리', '깃발', '아브라함', '이삭', '야곱',
    '요셉', '모세', '여호수아', '갈렙', '사무엘', '다윗', '솔로몬', '엘리야', '엘리사', '에스더',
    '느헤미야', '에스라', '룻', '한나', '요나단', '다니엘', '마리아', '요한', '베드로', '야고보',
    '빌립', '도마', '마태', '시몬', '바나바', '바울', '디모데', '디도', '누가'
  ];

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async generateRandomNickname(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 50; // 최대 50번 시도

    while (attempts < maxAttempts) {
      const randomAdjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
      const randomNoun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
      const nickname = `${randomAdjective} ${randomNoun}`;

      // 중복 확인
      const existingUser = await this.usersRepository.findOne({
        where: { nickname, is_deleted: false }
      });

      if (!existingUser) {
        return nickname;
      }

      attempts++;
    }

    // 50번 시도 후에도 중복이 있다면 타임스탬프를 추가
    const randomAdjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const randomNoun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
    const timestamp = Date.now().toString().slice(-4); // 마지막 4자리
    return `${randomAdjective} ${randomNoun}${timestamp}`;
  }

  async create(createUserDto: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id, is_deleted: false },
      select: {
        id: true,
        nickname: true,
        church_name: true,
        faith_confession: true,
        is_approved: true,
        profile_image_url: true,
        kakao_id: true,
        kakao_email: true,
        created_at: true
      }
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByKakaoId(kakaoId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { kakao_id: kakaoId } });
    if (!user) {
      throw new NotFoundException(`User with Kakao ID ${kakaoId} not found`);
    }
    return user;
  }

  async findByKakaoEmail(kakaoEmail: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { kakao_email: kakaoEmail } });
    if (!user) {
      throw new NotFoundException(`User with Kakao Email ${kakaoEmail} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // 먼저 사용자 정보를 가져와서 kakao_id와 kakao_email을 확인
    const user = await this.findOne(id);
    
    // kakao_id와 kakao_email이 있는 경우 _deleted 태그를 붙임
    const updateData: any = {
      is_deleted: true,
      deleted_at: new Date(),
      nickname: '알 수 없음' // 탈퇴 시 닉네임을 "알수없음"으로 변경
    };
    
    if (user.kakao_id) {
      updateData.kakao_id = `${user.kakao_id}_deleted`;
    }
    
    if (user.kakao_email) {
      updateData.kakao_email = `${user.kakao_email}_deleted`;
    }
    
    const result = await this.usersRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
} 