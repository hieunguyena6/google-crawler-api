import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Keyword } from './Keyword';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  path: string;

  @Column()
  name: string;

  @ManyToOne(() => User, user => user.files)
  uploadedBy: User;

  @OneToMany(() => Keyword, keyword => keyword.file)
  keywords: Keyword[];

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
