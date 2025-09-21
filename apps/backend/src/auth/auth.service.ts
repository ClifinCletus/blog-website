import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SiginInInput } from './dto/signin.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPyload';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  //to check whether the user present in db and sigin
  async validateLocalUser({ email, password }: SiginInInput) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || typeof user.password !== 'string') {
      //because as we have done as the password as nullable in the prisma model
      throw new UnauthorizedException('User not found');
    }

    //uses the argon 2 packge for hashing and verifying
    const passwordMatched = await verify(user.password, password);

    if (!passwordMatched)
      throw new UnauthorizedException('invalid credentials');

    return user;
  }

  //generating the access token for the authennticate user
  async generateToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId }; //we need to add some data on the token hence, we are suing the userid, adding it on the token , hence for proper identifcation
    const accessToken = await this.jwtService.signAsync(payload); //to create the token
    return { accessToken };
  }

  /**
   * ======================================================
   * ✅ login
   * ======================================================
   * - Purpose: Final login step after user validation.
   * - Process:
   *   1. Generate JWT access token.
   *   2. Return the token + basic user info (id, name, avatar).
   * - Why? So client (frontend) can use this token to access
   *   protected resources and also know who is logged in.
   */
  //*** here we done as, we would verify using the user using the validateLocalUser and then using this fn  and the generatetokens, we generate tokens and pass the information of the user (who logging in) with the access token */
  async login(user: User) {
    const { accessToken } = await this.generateToken(user.id);
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      accessToken,
    };
  }

  //fn that would be called from the JwtStratergy to verify the user and add the return the id
  async validateUser(userId: number): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return user.id;
  }
}
