import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { GroupMember } from './group-member.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column()
  category: string;

  @ManyToOne(() => User, (user) => user.created_groups)
  creator: User;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => GroupMember, (groupMember) => groupMember.group)
  members: GroupMember[];
} 