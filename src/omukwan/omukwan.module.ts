import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OmukwanController } from './omukwan.controller';
import { OmukwanService } from './omukwan.service';
import { Omukwan } from '../entities/omukwan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Omukwan])],
  controllers: [OmukwanController],
  providers: [OmukwanService],
  exports: [OmukwanService],
})
export class OmukwanModule {} 