import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // 카카오 로그인과 일반 로그인 모두 지원
    if (payload.type === 'kakao') {
      return { 
        id: payload.sub, 
        kakaoId: payload.kakaoId,
        type: 'kakao'
      };
    }
    
    return { 
      id: payload.sub, 
      phone_number: payload.phoneNumber,
      type: 'phone'
    };
  }
} 