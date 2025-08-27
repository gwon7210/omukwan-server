import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('omukwan')
export class Omukwan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', unique: true })
  date: Date;

  @Column()
  verseRange: string;

  @Column()
  verseTitle: string;

  @Column({ type: 'text' })
  fullVerse: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 