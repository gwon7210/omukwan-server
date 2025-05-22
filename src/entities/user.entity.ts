import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Post } from './post.entity';
import { Like } from './like.entity';
import { Group } from './group.entity';
import { GroupMember } from './group-member.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone_number: string;

  @Column({ default: false })
  is_phone_verified: boolean;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  church_name: string;

  @Column({ nullable: true })
  faith_confession: string;

  @Column({ default: false })
  is_approved: boolean;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  profile_image_url: string | null;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => GroupMember, (groupMember) => groupMember.user)
  group_memberships: GroupMember[];
} 