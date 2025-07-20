import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: Partial<User>) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMe(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Post('profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `profile-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadProfileImage(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/profiles/${file.filename}` : undefined;
    return this.usersService.update(req.user.id, { profile_image_url: imageUrl });
  }

  @Delete('profile-image')
  @UseGuards(JwtAuthGuard)
  async deleteProfileImage(@Request() req) {
    return this.usersService.update(req.user.id, { profile_image_url: null });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: Partial<User>) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Delete('me')
  // @UseGuards(JwtAuthGuard)
  async deleteAccount(@Request() req) {
    await this.usersService.remove(req.user.id);
    return { message: '계정이 삭제되었습니다.' };
  }

  @Get('search/kakao/:kakaoId')
  @UseGuards(JwtAuthGuard)
  async findByKakaoId(@Param('kakaoId') kakaoId: string) {
    const user = await this.usersService.findByKakaoId(kakaoId);
    return {
      id: user.id,
      nickname: user.nickname,
      profile_image_url: user.profile_image_url
    };
  }
  
  @Get('search/kakao-email/:kakaoEmail')
  @UseGuards(JwtAuthGuard)
  async findByKakaoEmail(@Param('kakaoEmail') kakaoEmail: string) {
    const user = await this.usersService.findByKakaoEmail(kakaoEmail);
    return {
      id: user.id,
      nickname: user.nickname,
      profile_image_url: user.profile_image_url
    };
  }
} 