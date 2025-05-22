import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Group } from './group.entity';

@Entity('group_members')
@Unique(['user', 'group'])
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group)
  group: Group;

  @ManyToOne(() => User, (user) => user.group_memberships)
  user: User;

  @CreateDateColumn()
  joined_at: Date;
} 