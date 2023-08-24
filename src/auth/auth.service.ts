import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { sendPasswordResetEmail } from './email.utils';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private userRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<void> {
    return await this.userRepository.createUser(signUpDto);
  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signInDto;
    const user = await this.userRepository.findOne({ email });

    if (user) {
      if (user.isVerified && (await bcrypt.compare(password, user.password))) {
        const payload: JwtPayload = { email };
        const accessToken = await this.jwtService.sign(payload);
        return { accessToken };
      } else {
        throw new UnauthorizedException(
          'Please check your login credentials or verify your account.',
        );
      }
    } else {
      throw new UnauthorizedException(
        'Please check your login credentials or verify your account.',
      );
    }
  }

  async verify(id: string, verificationCode: string): Promise<boolean> {
    const user = await this.userRepository.findOne(id);

    if (user && user.verificationCode === verificationCode) {
      user.isVerified = true;
      user.verificationCode = null;
      await this.userRepository.save(user);
      return true;
    }

    return false;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = Math.random().toString().slice(2, 8);

    user.resetCode = resetToken;
    await this.userRepository.save(user);

    await sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { email, resetCode, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new ConflictException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({ email, resetCode });

    if (!user) {
      throw new NotFoundException('User not found or invalid reset token');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetCode = null;
    await this.userRepository.save(user);

    // You might want to handle additional error cases (e.g., saving errors) and provide appropriate responses
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}
