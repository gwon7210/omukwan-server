import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
} 