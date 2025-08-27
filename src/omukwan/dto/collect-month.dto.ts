import { IsInt, Min, Max } from 'class-validator';

export class CollectMonthDto {
  @IsInt()
  @Min(2000)
  @Max(9999)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
} 