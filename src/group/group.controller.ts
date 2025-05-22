import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
} 