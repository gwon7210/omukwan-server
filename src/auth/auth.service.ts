import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { KakaoService } from './kakao.service';
import { KakaoLoginDto } from './dto/kakao-login.dto';
import { KakaoSignupDto } from './dto/kakao-signup.dto';
import { TestLoginDto } from './dto/test-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private kakaoService: KakaoService,
  ) {}

  async kakaoLogin(kakaoLoginDto: KakaoLoginDto) {
    // 카카오 액세스 토큰 검증
    const isValidToken = await this.kakaoService.validateAccessToken(kakaoLoginDto.access_token);
    if (!isValidToken) {
      throw new UnauthorizedException('유효하지 않은 카카오 액세스 토큰입니다.');
    }

    // 기존 사용자 확인
    const existingUser = await this.usersRepository.findOne({
      where: { kakao_id: kakaoLoginDto.user_id },
    });

    if (!existingUser) {
      throw new UnauthorizedException('등록되지 않은 사용자입니다. 회원가입을 진행해주세요.');
    }

    // 마지막 로그인 시간 업데이트
    existingUser.last_login_at = new Date();
    await this.usersRepository.save(existingUser);

    // JWT 토큰 생성
    const payload = { 
      sub: existingUser.id, 
      kakaoId: existingUser.kakao_id,
      type: 'kakao'
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: existingUser.id,
        nickname: existingUser.nickname,
        email: existingUser.kakao_email,
        profile_image: existingUser.profile_image_url,
      },
    };
  }

  async kakaoSignup(kakaoSignupDto: KakaoSignupDto) {
    // 카카오 액세스 토큰 검증
    const isValidToken = await this.kakaoService.validateAccessToken(kakaoSignupDto.access_token);
    if (!isValidToken) {
      throw new UnauthorizedException('유효하지 않은 카카오 액세스 토큰입니다.');
    }

    // 기존 사용자 확인
    const existingUser = await this.usersRepository.findOne({
      where: { kakao_id: kakaoSignupDto.user_id },
    });

    if (existingUser) {
      throw new ConflictException('이미 등록된 사용자입니다.');
    }

    // 새 사용자 생성
    const newUser = this.usersRepository.create({
      kakao_id: kakaoSignupDto.user_id,
      kakao_email: kakaoSignupDto.email,
      nickname: kakaoSignupDto.nickname,
      profile_image_url: kakaoSignupDto.profile_image,
      church_name: kakaoSignupDto.church_name,
      faith_confession: kakaoSignupDto.faith_confession,
      is_approved: false, // 관리자 승인 필요
    });

    const savedUser = await this.usersRepository.save(newUser);

    // JWT 토큰 생성
    const payload = { 
      sub: savedUser.id, 
      kakaoId: savedUser.kakao_id,
      type: 'kakao'
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: savedUser.id,
        nickname: savedUser.nickname,
        email: savedUser.kakao_email,
        profile_image: savedUser.profile_image_url,
      },
    };
  }

  async testLogin(testLoginDto: TestLoginDto) {
    // 이메일로 사용자 찾기
    const user = await this.usersRepository.findOne({
      where: { kakao_email: testLoginDto.email },
    });

    if (!user) {
      throw new NotFoundException('등록되지 않은 사용자입니다.');
    }

    // 마지막 로그인 시간 업데이트
    user.last_login_at = new Date();
    await this.usersRepository.save(user);

    // JWT 토큰 생성
    const payload = { 
      sub: user.id, 
      kakaoId: user.kakao_id,
      type: 'test'
    };
    
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.kakao_email,
        nickname: user.nickname,
      },
    };
  }
} 