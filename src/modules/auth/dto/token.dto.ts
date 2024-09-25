import { TokenType } from 'src/core/enum/token_type.enum';
import { User } from 'src/modules/user/schema/user.entity';

export class TokenDto {
  token_id?: number;

  token: string;

  isBlackListed: boolean;

  Token_Type: TokenType;

  user: User;

  createdAt?: Date;

  updatedAt?: Date;
}
