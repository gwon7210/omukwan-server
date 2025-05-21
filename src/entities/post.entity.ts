import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Like } from './like.entity';
import { Comment } from './comment.entity';
import { Group } from './group.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  user: User;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  image_url: string;

  @Column()
  post_type: string;

  @Column({ type: 'enum', enum: ['public', 'group', 'private'], default: 'public' })
  visibility: 'public' | 'group' | 'private';

  @ManyToOne(() => Group, (group) => group.posts, { nullable: true })
  group: Group | null;

  @Column({ type: 'enum', enum: ['free', 'template'], default: 'free' })
  mode: 'free' | 'template';

  @Column({ type: 'text', nullable: true })
  q1_answer: string;

  @Column({ type: 'text', nullable: true })
  q2_answer: string;

  @Column({ type: 'text', nullable: true })
  q3_answer: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Like, (like) => like.post, { onDelete: 'CASCADE' })
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.post, { onDelete: 'CASCADE' })
  comments: Comment[];
} 