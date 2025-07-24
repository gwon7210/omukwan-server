import { Controller, Get, Query, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { OmukwanService } from './omukwan.service';
import { Omukwan } from '../entities/omukwan.entity';

@Controller('omukwan')
export class OmukwanController {
  constructor(private readonly omukwanService: OmukwanService) {}

  @Get('daily-verse')
  async getDailyVerse(@Query('date') date: string) {
    // 날짜 형식 검증
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new HttpException('올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.', HttpStatus.BAD_REQUEST);
    }

    try {
      const omukwan = await this.omukwanService.getDailyVerse(date);

      return {
        success: true,
        data: {
          verseRange: omukwan.verseRange,
          verseTitle: omukwan.verseTitle,
          fullVerse: omukwan.fullVerse,
          date: typeof omukwan.date === 'string' ? omukwan.date : omukwan.date.toISOString().split('T')[0],
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: '해당 날짜의 말씀을 찾을 수 없습니다.',
        };
      }
      throw error;
    }
  }
} 