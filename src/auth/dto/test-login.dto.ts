import { IsEmail, IsNotEmpty } from 'class-validator';

export class TestLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
} 