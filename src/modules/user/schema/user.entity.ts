import { Token } from 'src/modules/auth/schema/token.entity';
import { BookShelf } from 'src/modules/book-shelf/schema/bookShelf.entity';
import { Logger } from 'src/modules/logger/schema/logger.entity';
import { Session } from 'src/modules/sessions/schema/sessions.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  country: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'application' })
  provider: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    nullable: true,
  })
  user_image: string;

  @Column({
    nullable: true,
  })
  user_role: string;

  @Column({
    nullable: true,
  })
  userType: string;

  @Column({
    nullable: true,
  })
  sokrates_permission: string;

  @Column({
    nullable: true,
  })
  subscriptionID: string;

  @Column({
    nullable: true,
  })
  stripe_subscription_id: string;

  @CreateDateColumn({
    nullable: true,
  })
  lastActivity: Date;

  @Column({
    nullable: true,
  })
  researcher_points: number;

  @Column({
    nullable: true,
  })
  sessions_total: number;

  @Column('boolean', { default: false })
  isLogged: boolean;

  @Column({
    nullable: true,
  })
  on_trial: string;

  @Column({
    nullable: true,
  })
  trial_period: string;

  @Column({
    nullable: true,
  })
  answerSource: string;

  @Column('boolean', { default: false })
  isDeleted: boolean;

  @Column({
    nullable: true,
  })
  sheerIdVerification: string;

  @Column({
    nullable: true,
  })
  sheerIdStatus: string;

  @Column({
    nullable: true,
  })
  questionAnswerSource: string;

  @Column({
    nullable: true,
  })
  stripeCustomerId: string;

  @Column('boolean', { default: false })
  isActive: boolean;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true })
  otp_expiry: Date;

  @Column({ default: 0 })
  total_time_saved: number;

  @Column({ nullable: true })
  g_access_token: string;

  @Column({ nullable: true, default: false })
  drive_access: boolean;

  @Column({ nullable: true })
  drive_access_token: string;

  @Column({ nullable: true })
  drive_refresh_token: string;

  @Column({ nullable: true })
  drive_scope: string;

  @Column({ nullable: true })
  drive_token_type: string;

  @Column({ nullable: true })
  drive_expairy_date: number;

  @Column({ default: 0 })
  welcomeCounter: number;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => Logger, (logger) => logger.user)
  loggers: Logger[];

  @OneToMany(() => BookShelf, (bookShelf) => bookShelf.user)
  book_shelf: BookShelf[];

  @OneToMany(() => Session, (session) => session.user)
  session: Session[];

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
// {
//   nullable: true,
// }
//   unique: true,
