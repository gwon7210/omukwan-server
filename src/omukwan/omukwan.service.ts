import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Omukwan } from '../entities/omukwan.entity';

@Injectable()
export class OmukwanService {
  private readonly logger = new Logger(OmukwanService.name);

  constructor(
    @InjectRepository(Omukwan)
    private omukwanRepository: Repository<Omukwan>,
    private readonly httpService: HttpService,
  ) {}

  async getDailyVerse(date: string): Promise<Omukwan> {
    const omukwan = await this.omukwanRepository.findOne({
      where: { date: new Date(date) },
    });

    if (!omukwan) {
      throw new NotFoundException('해당 날짜의 말씀을 찾을 수 없습니다.');
    }

    return omukwan;
  }

  async createDailyVerse(omukwanData: Partial<Omukwan>): Promise<Omukwan> {
    const omukwan = this.omukwanRepository.create(omukwanData);
    return await this.omukwanRepository.save(omukwan);
  }

  async updateDailyVerse(date: string, omukwanData: Partial<Omukwan>): Promise<Omukwan> {
    const omukwan = await this.getDailyVerse(date);
    Object.assign(omukwan, omukwanData);
    return await this.omukwanRepository.save(omukwan);
  }

  async deleteDailyVerse(date: string): Promise<void> {
    const omukwan = await this.getDailyVerse(date);
    await this.omukwanRepository.remove(omukwan);
  }

  // 외부 API 호출 메서드들
  private async fetchBibleInfo(date: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post('https://sum.su.or.kr:8888/Ajax/Bible/BodyBibleCont', {
          qt_ty: 'QT1',
          Base_de: date,
          Bibletype: '1',
        }, {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`본문 정보 API 호출 실패 (${date}):`, error.message);
      throw error;
    }
  }

  private async fetchBibleContent(date: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post('https://sum.su.or.kr:8888/Ajax/Bible/BodyBible', {
          qt_ty: 'QT1',
          Base_de: date,
        }, {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`본문 전체 API 호출 실패 (${date}):`, error.message);
      throw error;
    }
  }

  private parseVerseRange(bibleName: string, bibleChapter: string): string {
    // 괄호 제거
    const cleanName = bibleName.replace(/\([^)]*\)/g, '').trim();
    return `${cleanName} ${bibleChapter}`;
  }

  private parseFullVerse(verseData: any[]): string {
    return verseData
      .map(item => `${item.Verse} ${item.Bible_Cn}`)
      .join('\n');
  }

  async collectDailyData(date: string): Promise<Omukwan> {
    this.logger.log(`${date} 날짜의 묵상 데이터 수집 시작`);

    try {
      // 두 API를 병렬로 호출
      const [bibleInfo, bibleContent] = await Promise.all([
        this.fetchBibleInfo(date),
        this.fetchBibleContent(date),
      ]);

      // 데이터 파싱
      const verseTitle = bibleInfo.Qt_sj;
      const verseRange = this.parseVerseRange(bibleInfo.Bible_name, bibleInfo.Bible_chapter);
      const fullVerse = this.parseFullVerse(bibleContent);

      // 기존 데이터 확인
      const existingOmukwan = await this.omukwanRepository.findOne({
        where: { date: new Date(date) },
      });

      const omukwanData = {
        date: new Date(date),
        verseTitle,
        verseRange,
        fullVerse,
      };

      let savedOmukwan: Omukwan;

      if (existingOmukwan) {
        // 기존 데이터 업데이트
        Object.assign(existingOmukwan, omukwanData);
        savedOmukwan = await this.omukwanRepository.save(existingOmukwan);
        this.logger.log(`${date} 데이터 업데이트 완료`);
      } else {
        // 새 데이터 생성
        const newOmukwan = this.omukwanRepository.create(omukwanData);
        savedOmukwan = await this.omukwanRepository.save(newOmukwan);
        this.logger.log(`${date} 데이터 생성 완료`);
      }

      return savedOmukwan;
    } catch (error) {
      this.logger.error(`${date} 데이터 수집 실패:`, error.message);
      throw error;
    }
  }

  async collectMonthlyData(year: number, month: number): Promise<Omukwan[]> {
    this.logger.log(`${year}년 ${month}월 묵상 데이터 수집 시작`);

    // 해당 월의 마지막 날 계산
    const lastDay = new Date(year, month, 0).getDate();
    const results: Omukwan[] = [];
    const errors: string[] = [];

    for (let day = 1; day <= lastDay; day++) {
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      try {
        const result = await this.collectDailyData(date);
        results.push(result);
        
        // API 호출 간격을 두어 서버 부하 방지
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        this.logger.warn(`${date} 데이터 수집 실패: ${error.message}`);
        errors.push(`${date}: ${error.message}`);
      }
    }

    this.logger.log(`${year}년 ${month}월 데이터 수집 완료. 성공: ${results.length}건, 실패: ${errors.length}건`);

    if (errors.length > 0) {
      this.logger.warn('실패한 날짜들:', errors);
    }

    return results;
  }
} 