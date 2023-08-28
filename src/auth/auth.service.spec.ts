import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';

const mockUsersRepository = () => ({
  createUser: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository;
  let jwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useFactory: mockUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signUp', () => {
    it('should successfully create a new user', async () => {
      const signUpDto: SignUpDto = {
        firstName: 'testuser',
        lastName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      usersRepository.createUser.mockResolvedValue(undefined);

      await authService.signUp(signUpDto);

      expect(usersRepository.createUser).toHaveBeenCalledWith(signUpDto);
    });

    it('should throw ConflictException when user already exists', async () => {
      const signUpDto: SignUpDto = {
        firstName: 'existinguser',
        lastName: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };

      usersRepository.createUser.mockRejectedValue({ code: '23505' });

      try {
        await authService.signUp(signUpDto);
      } catch (error) {
        expect(error.code).toEqual('23505');
      }

      expect(usersRepository.createUser).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('should return an access token when valid credentials are provided', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        email: signInDto.email,
        password: await bcrypt.hash('password123', 10),
        isVerified: true,
      };

      usersRepository.findOne.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('mockAccessToken');

      const result = await authService.signIn(signInDto);

      expect(result.accessToken).toBe('mockAccessToken');
    });

    it('should throw UnauthorizedException when invalid credentials are provided', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'invalidPassword',
      };

      usersRepository.findOne.mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verify', () => {
    it('should mark the user as verified when valid verification code is provided', async () => {
      const userId = 'someUserId';
      const verificationCode = 'validCode';
      const mockUser = {
        id: userId,
        verificationCode,
        isVerified: true,
      };

      usersRepository.findOne.mockResolvedValue(mockUser);
      usersRepository.save.mockResolvedValue(mockUser);

      const result = await authService.verify(userId, verificationCode);

      expect(result).toBe(true);
      expect(mockUser.isVerified).toBe(true);
      expect(mockUser.verificationCode).toBeNull();
      expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should return false when invalid verification code is provided', async () => {
      const userId = 'someUserId';
      const verificationCode = 'invalidCode';
      const mockUser = {
        id: userId,
        verificationCode: 'validCode',
        isVerified: undefined,
      };

      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.verify(userId, verificationCode);

      expect(result).toBe(false);
      expect(mockUser.isVerified).toBeUndefined();
      expect(mockUser.verificationCode).toBe('validCode');
      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should send a password reset email when a valid email is provided', async () => {
      const email = 'test@example.com';
      const mockUser = {
        email,
      };

      usersRepository.findOne.mockResolvedValue(mockUser);

      await authService.forgotPassword({ email });

      expect(usersRepository.findOne).toHaveBeenCalledWith({ email });
      // Add assertions for sending password reset email
    });

    it('should throw NotFoundException when invalid email is provided', async () => {
      const email = 'test@example.com';

      usersRepository.findOne.mockResolvedValue(null);

      await expect(authService.forgotPassword({ email })).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('resetPassword', () => {
    it('should reset the password when valid reset information is provided', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'test@example.com',
        resetCode: 'validCode',
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };

      const mockUser = {
        email: resetPasswordDto.email,
        resetCode: resetPasswordDto.resetCode,
      };

      usersRepository.findOne.mockResolvedValue(mockUser);
      usersRepository.save.mockResolvedValue({}); // Doesn't matter for this test

      await authService.resetPassword(resetPasswordDto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: resetPasswordDto.email,
        resetCode: resetPasswordDto.resetCode,
      });
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when invalid reset information is provided', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'test@example.com',
        resetCode: 'invalidCode',
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };

      usersRepository.findOne.mockResolvedValue(null);

      await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: resetPasswordDto.email,
        resetCode: resetPasswordDto.resetCode,
      });
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when passwords do not match', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'test@example.com',
        resetCode: 'validCode',
        password: 'newPassword',
        confirmPassword: 'nonMatchingPassword',
      };

      const mockUser = {
        email: resetPasswordDto.email,
        resetCode: resetPasswordDto.resetCode,
      };

      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a user when valid user ID is provided', async () => {
      const userId = 'someUserId';
      const mockDeleteResult = {
        affected: 1,
      };

      usersRepository.delete.mockResolvedValue(mockDeleteResult);

      await authService.delete(userId);

      expect(usersRepository.delete).toHaveBeenCalledWith({ id: userId });
    });

    it('should throw NotFoundException when invalid user ID is provided', async () => {
      const userId = 'nonExistentUserId';
      const mockDeleteResult = {
        affected: 0,
      };

      usersRepository.delete.mockResolvedValue(mockDeleteResult);

      await expect(authService.delete(userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.delete).toHaveBeenCalledWith({ id: userId });
    });
  });
});
