import { User } from 'src/modules/user/schema/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'logger' })
export class Logger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  api_method: string;

  @Column()
  api_endpoint: string;

  @Column()
  token: string;

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
