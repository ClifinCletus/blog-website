//the jwt auth passport startergy for the protected route(known)

import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthJwtPayload } from '../types/auth-jwtPyload';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStratergy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') as string, // Cast to string
      ignoreExpiration: false, //if expired token reject approval to access the protected route
    });
  }

  //when extracted the token and been verified, comes here
  //for validating the token and appending needed data to requeat(here appended the user's id)
  validate(payload: AuthJwtPayload) {
    const userId = payload.sub;
    return this.authService.validateUser(userId); //hence this is now added to the req(the return from this service is the user's id)
    //******** VV IMP: what ever we add from here, we can access it as only req.user *********/
  }
}
