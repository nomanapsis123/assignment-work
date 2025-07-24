import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserInterface } from 'src/authentication/common/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('AT_SECRET'),
    });
  }

  validate(payload: UserInterface) {    
    if (!payload) {
      throw new UnauthorizedException('Unauthorized!');
    }
    return payload;
  }
}
