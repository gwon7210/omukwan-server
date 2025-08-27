import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Group } from './group.entity';

@Entity('group_invites')
export class GroupInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, { nullable: false })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'inviter_id' })
  inviter: User;

  @Column()
  kakao_email: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  })
  status: 'pending' | 'accepted' | 'declined';

  @CreateDateColumn()
  created_at: Date;
} 