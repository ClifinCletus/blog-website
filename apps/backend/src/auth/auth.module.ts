import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { JwtStrategy } from './strategies/jwt.strategy';
// import { GoogleStrategy } from './strategies/google.strategy';
// import { AuthController } from './auth.controller';

@Module({
  imports: [
    // 👇 Here we are registering the JWT module dynamically using `registerAsync`.
    // Why async? Because we want to **inject the ConfigService** and read environment variables
    // at runtime instead of hardcoding secrets in the code.

    JwtModule.registerAsync({
      // 👇 This allows the JwtModule to use other modules (like ConfigModule)
      // inside its factory function. Without this, ConfigService wouldn’t be available.
      imports: [ConfigModule],

      // 👇 Specify which providers should be injected into the factory function.
      // Here we are injecting the ConfigService so we can access environment variables.
      inject: [ConfigService],

      // 👇 The factory function is where we configure the JwtModule dynamically.
      // It receives the injected services (ConfigService here) as arguments.
      useFactory: async (configService: ConfigService) => ({
        // 👇 Read the JWT secret from environment variables using ConfigService.
        secret: configService.get<string>('JWT_SECRET'),

        // 👇 Configure sign options, like token expiration, dynamically from env
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPRIESIN'), // token expiry time
        },
      }),
    }),
  ],

  providers: [
    AuthResolver,
    AuthService,
    PrismaService,
    // JwtStrategy,
    // GoogleStrategy,
  ],
  // controllers: [AuthController],
})
export class AuthModule {}
