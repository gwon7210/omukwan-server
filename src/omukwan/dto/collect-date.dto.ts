import { IsString, Matches } from 'class-validator';

export class CollectDateDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜는 YYYY-MM-DD 형식이어야 합니다.',
  })
  date: string;
} 