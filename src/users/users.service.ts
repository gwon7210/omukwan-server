import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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