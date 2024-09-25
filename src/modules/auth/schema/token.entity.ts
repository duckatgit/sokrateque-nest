import { User } from 'src/modules/user/schema/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TokenType } from 'src/core/enum/token_type.enum';

@Entity({ name: 'token' })
export class Token {
  @PrimaryGeneratedColumn() token_id: number;

  @Column()
  token: string;

  @ManyToOne(() => User, (user) => user.tokens)
  user: User;

  @Column('boolean', { default: false })
  isBlackListed: boolean;

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  Token_Type: TokenType;

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
