import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class KakaoSignupDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  profile_image?: string;

  @IsString()
  @IsNotEmpty()
  church_name: string;

  @IsString()
  @IsNotEmpty()
  faith_confession: string;
} 