import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Like } from './like.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  user: User;

  @Column({ nullable: true })
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  image_url: string;

  @Column()
  post_type: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];
} 