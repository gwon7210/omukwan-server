import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { GroupInvite } from '../entities/group-invite.entity';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMember, GroupInvite, Post, User]),
    NotificationsModule
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {} 