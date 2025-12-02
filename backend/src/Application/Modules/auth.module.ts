import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../../auth/jwt.strategy';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { UserSchema } from '../../Data/models/user.schema';
import { AuthController } from '../Controllers/auth.controller';
import { AuthService } from '../Services/auth.service';
import { MailModule } from '../../infrastructure/mail/mail.module';

@Module({
  imports: [
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default_secret_key',
        signOptions: {
          expiresIn: '24h',
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, AdminGuard],
  exports: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, AdminGuard, JwtModule, PassportModule],
})
export class AuthModule { }
