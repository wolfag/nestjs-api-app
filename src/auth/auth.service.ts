import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDTO } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jswService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(authDTO: AuthDTO) {
    const hashedPassword = await argon.hash(authDTO.password);
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: authDTO.email,
          password: hashedPassword,
          firstName: '',
          lastName: '',
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      return user;
    } catch (error) {
      // https://www.prisma.io/docs/orm/reference/error-reference#error-codes
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credential error');
      }
    }
  }

  async login(authDTO: AuthDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: authDTO.email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
    if (!user) {
      throw new ForbiddenException('Credential error');
    }

    const passwordMatched = await argon.verify(user.password, authDTO.password);
    if (!passwordMatched) {
      throw new ForbiddenException('Credential error');
    }

    return { accessToken: await this.signJwtToken(user.id, user.email) };
  }

  async signJwtToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const jwtString = await this.jswService.signAsync(payload, {
      expiresIn: '10m',
      secret: this.configService.get('JWT_SECRET'),
    });

    return jwtString;
  }
}
