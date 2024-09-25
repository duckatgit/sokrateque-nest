import { User } from 'src/modules/user/schema/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'session' })
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sessionName: string;

  @Column()
  question: string;

  @Column()
  questionType: string;

  @Column('simple-array', { nullable: true })
  fileIds: string[];

  @Column('simple-array', { nullable: true })
  folderIds: string[];

  @Column('simple-array', { nullable: true })
  questiningUrl: string[];

  @Column('simple-array', { nullable: true })
  sessionIds: string[];

  @Column('simple-array', { nullable: true })
  answers: string[];

  @Column({ default: false })
  ignore: boolean;

  @Column({ type: 'text' })
  answer: string;

  @Column({ nullable: true })
  parent: string;

  @Column()
  isParent: boolean;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => User, (user) => user.loggers, { nullable: true })
  user: User;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
