import { Controller, Get, Post, Query, Body, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { OmukwanService } from './omukwan.service';
import { CollectMonthDto } from './dto/collect-month.dto';
import { CollectDateDto } from './dto/collect-date.dto';

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

  @Post('collect/date')
  async collectDailyData(@Body() collectDateDto: CollectDateDto) {
    try {
      const result = await this.omukwanService.collectDailyData(collectDateDto.date);
      
      return {
        success: true,
        message: '묵상 데이터 수집이 완료되었습니다.',
        data: {
          date: typeof result.date === 'string' ? result.date : result.date.toISOString().split('T')[0],
          verseTitle: result.verseTitle,
          verseRange: result.verseRange,
          fullVerse: result.fullVerse,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `묵상 데이터 수집에 실패했습니다: ${error.message}`,
      };
    }
  }

  @Post('collect/month')
  async collectMonthlyData(@Body() collectMonthDto: CollectMonthDto) {
    try {
      const results = await this.omukwanService.collectMonthlyData(
        collectMonthDto.year,
        collectMonthDto.month,
      );

      return {
        success: true,
        message: `${collectMonthDto.year}년 ${collectMonthDto.month}월 묵상 데이터 수집이 완료되었습니다.`,
        data: {
          totalCollected: results.length,
          year: collectMonthDto.year,
          month: collectMonthDto.month,
          results: results.map(item => ({
            date: typeof item.date === 'string' ? item.date : item.date.toISOString().split('T')[0],
            verseTitle: item.verseTitle,
            verseRange: item.verseRange,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `월별 묵상 데이터 수집에 실패했습니다: ${error.message}`,
      };
    }
  }
} 