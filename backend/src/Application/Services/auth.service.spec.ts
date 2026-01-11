import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../infrastructure/mail/mail.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUserModel: any = jest.fn();
  mockUserModel.findOne = jest.fn();
  mockUserModel.findById = jest.fn();
  mockUserModel.findByIdAndUpdate = jest.fn();
  mockUserModel.create = jest.fn();

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'Customer' as const,
      };

      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const mockUser = {
        _id: 'user-id',
        ...registerDto,
        password: 'hashed-password',
        email: registerDto.email.toLowerCase(),
        toObject: jest.fn().mockReturnValue({
          _id: 'user-id',
          name: registerDto.name,
          email: registerDto.email.toLowerCase(),
          password: 'hashed-password',
          phone: registerDto.phone,
          role: registerDto.role,
        }),
      };

      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result.user).not.toHaveProperty('password');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: registerDto.email.toLowerCase() });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already exists', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'Customer' as const,
      };

      mockUserModel.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if password is too short', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345',
        role: 'Customer' as const,
      };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid role', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'InvalidRole' as any,
      };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: 'user-id',
        name: 'Test User',
        email: loginDto.email.toLowerCase(),
        password: 'hashed-password',
        role: 'Customer',
        toObject: jest.fn().mockReturnValue({
          _id: 'user-id',
          name: 'Test User',
          email: loginDto.email.toLowerCase(),
          password: 'hashed-password',
          role: 'Customer',
        }),
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result.user).not.toHaveProperty('password');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginDto.email.toLowerCase() });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'notfound@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: 'user-id',
        email: loginDto.email,
        password: 'hashed-password',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if email or password is missing', async () => {
      await expect(service.login({ email: '', password: 'password' })).rejects.toThrow(BadRequestException);
      await expect(service.login({ email: 'test@example.com', password: '' })).rejects.toThrow(BadRequestException);
    });
  });
});
