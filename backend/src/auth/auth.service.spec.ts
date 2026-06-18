import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let prismaService: { user: { update: jest.Mock } };

  const mockUser = {
    id: 'user-uuid',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    refreshTokenHash: 'hashed-refresh-token',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = { user: { update: jest.fn().mockResolvedValue({}) } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const values: Record<string, string> = {
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return values[key] ?? null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('deve retornar accessToken, refreshToken e user ao registrar', async () => {
      usersService.create.mockResolvedValue(mockUser as any);

      const result = await service.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
    });

    it('deve lançar ConflictException quando e-mail já existe', async () => {
      usersService.create.mockRejectedValue(
        new ConflictException('Email already in use'),
      );

      await expect(
        service.register({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('deve retornar accessToken e refreshToken com credenciais válidas', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });

    it('deve lançar UnauthorizedException quando e-mail não existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando senha está errada', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'john@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('deve retornar novos tokens com refresh token válido', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-uuid', email: 'john@example.com' } as any);
      usersService.findById.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });

    it('deve lançar UnauthorizedException quando token de refresh é inválido', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando hash não bate', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-uuid', email: 'john@example.com' } as any);
      usersService.findById.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.refresh('tampered-token')).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando usuário não possui refresh token armazenado', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-uuid', email: 'john@example.com' } as any);
      usersService.findById.mockResolvedValue({ ...mockUser, refreshTokenHash: null } as any);

      await expect(service.refresh('any-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('deve limpar o refreshTokenHash no banco', async () => {
      await service.logout('user-uuid');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
        data: { refreshTokenHash: null },
      });
    });
  });
});
