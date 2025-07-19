import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KakaoService {
  private readonly KAKAO_API_BASE_URL = 'https://kapi.kakao.com';

  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.KAKAO_API_BASE_URL}/v1/user/access_token_info`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.KAKAO_API_BASE_URL}/v2/user/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          property_keys: '["kakao_account.profile", "kakao_account.email"]',
        },
      });

      return response.data;
    } catch (error) {
      throw new UnauthorizedException('카카오 사용자 정보를 가져올 수 없습니다.');
    }
  }
} 