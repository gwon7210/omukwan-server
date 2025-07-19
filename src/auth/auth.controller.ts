import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { KakaoLoginDto } from './dto/kakao-login.dto';
import { KakaoSignupDto } from './dto/kakao-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao-login')
  async kakaoLogin(@Body() kakaoLoginDto: KakaoLoginDto) {
    return this.authService.kakaoLogin(kakaoLoginDto);
  }

  @Post('kakao-signup')
  async kakaoSignup(@Body() kakaoSignupDto: KakaoSignupDto) {
    return this.authService.kakaoSignup(kakaoSignupDto);
  }
} 