import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_ERROR } from '../messages';
import { AuthService } from 'src/modules/auth/auth.service';
@Injectable()
export class TockenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(AuthService) private authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorizations || request.headers.authorizations == '')
      throw new UnauthorizedException(AUTH_ERROR.unauthorizedUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [barer, token] = request.headers?.authorizations.split(' ');
    if (!token) {
      throw new UnauthorizedException(AUTH_ERROR.unauthorizedUser);
    }
    // const isInValid = await this.authService.isBlacklisted(token);
    // if (isInValid) throw new UnauthorizedException(AUTH_ERROR.unauthorizedUser);
    const expairy = await this.jwtService.decode(token);
    if (!expairy?.id)
      throw new UnauthorizedException(AUTH_ERROR.unauthorizedUser);
    const payload = {
      id: expairy.id,
      email: expairy.email,
      role: expairy.role,
    };
    if (expairy.exp < (new Date().getTime() + 1) / 1000) {
      // await this.authService.blacklistToken(token);
      throw new UnauthorizedException(AUTH_ERROR.unauthorizedUser);
    }
    request['user'] = payload;
    return true;
  }
}
