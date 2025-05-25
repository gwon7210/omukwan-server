import { Controller, Get, Post, UseGuards, Request, Param, Body } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  async findAll(@Request() req): Promise<{ groups: Group[] }> {
    const groups = await this.groupService.findAll(req.user.id);
    return { groups };
  }

  @Get(':groupId/today-omukwans/:date/users/:userId')
  async getTodayOmukwans(
    @Param('groupId') groupId: string,
    @Param('date') date: string,
    @Param('userId') userId: string,
  ) {
    return this.groupService.getTodayOmukwans(groupId, date, userId);
  }

  @Get(':groupId/today-omukwan-status/:date')
  async getTodayOmukwanStatus(
    @Param('groupId') groupId: string,
    @Param('date') date: string,
  ) {
    return this.groupService.getTodayOmukwanStatus(groupId, date);
  }

  @Get(':groupId/members')
  async getGroupMembers(@Param('groupId') groupId: string) {
    return this.groupService.getGroupMembers(groupId);
  }

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    return this.groupService.create(createGroupDto, req.user);
  }

  @Post(':id/invite')
  async inviteUser(
    @Param('id') id: string,
    @Body('phone_number') phoneNumber: string,
    @Request() req
  ) {
    await this.groupService.inviteUser(id, req.user.id, phoneNumber);
    return { message: '초대가 완료되었습니다.' };
  }

  @Post('invites/:id/accept')
  async acceptInvite(
    @Param('id') id: string,
    @Request() req
  ) {
    await this.groupService.acceptInvite(id, req.user.id);
    return { message: '초대를 수락했습니다.' };
  }

  @Post('invites/:id/decline')
  async declineInvite(
    @Param('id') id: string,
    @Request() req
  ) {
    await this.groupService.declineInvite(id, req.user.id);
    return { message: '초대를 거절했습니다.' };
  }
} 