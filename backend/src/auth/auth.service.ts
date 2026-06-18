import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends TokenPair {
  user: { id: string; name: string; email: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create(dto);
    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Credenciais inválidas');

    return this.buildResponse(user);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET');

    let payload: { sub: string; email: string };
    try {
      payload = this.jwtService.verify(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException('Token de refresh inválido ou expirado');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Token de refresh inválido');
    }

    const match = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!match) throw new UnauthorizedException('Token de refresh inválido');

    const tokens = this.generateTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  private async buildResponse(user: User): Promise<AuthResponse> {
    const tokens = this.generateTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return { ...tokens, user: { id: user.id, name: user.name, email: user.email } };
  }

  private generateTokens(userId: string, email: string): TokenPair {
    const payload = { sub: userId, email };
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    };
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const hash = await bcrypt.hash(token, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }
}
