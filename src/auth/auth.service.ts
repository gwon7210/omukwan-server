import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(phoneNumber: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { phone_number: phoneNumber },
      select: ['id', 'phone_number', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(phoneNumber: string, password: string) {
    const user = await this.validateUser(phoneNumber, password);
    const payload = { sub: user.id, phoneNumber: user.phone_number };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
} 