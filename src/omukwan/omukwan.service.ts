import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Omukwan } from '../entities/omukwan.entity';

@Injectable()
export class OmukwanService {
  constructor(
    @InjectRepository(Omukwan)
    private omukwanRepository: Repository<Omukwan>,
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
} 