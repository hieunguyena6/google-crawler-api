import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, Index } from 'typeorm';
import { File } from './File';

@Entity()
@Index(['keyword'])
export class Keyword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'text' })
  HTMLPage: string;

  @Column()
  keyword: string;

  @Column({ nullable: true })
  totalResult: string;

  @Column({ nullable: true })
  timeFetch: string;

  @Column({ nullable: true })
  totalAd: number;

  @Column({ nullable: true })
  totalLink: number;

  @ManyToOne(() => File, file => file.keywords)
  file: File;

  @Column()
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  dataFetchedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
