import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';
import { GetUser } from './get-user-decorator';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from './verified.guard';
import { SignInDto } from './dto/sign-in.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');

  constructor(private authService: AuthService) {}
  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<void> {
    const { email } = signUpDto;
    const signUp = await this.authService.signUp(signUpDto);

    this.logger.verbose(`User ${email} signed up`);
    return signUp;
  }

  @Post('/signin')
  async signIn(@Body() signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email } = signInDto;
    const signIn = await this.authService.signIn(signInDto);

    this.logger.verbose(`User ${email} signed in`);
    return signIn;
  }

  @Post('verify/:id')
  async verify(
    @Param('id') id: string,
    @Body('code') code: string,
  ): Promise<{ verified: boolean }> {
    const isVerified = await this.authService.verify(id, code);
    this.logger.verbose(`User ${id} is verified`);
    return { verified: isVerified };
  }

  @Post('/forgot_password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    const { email } = forgotPasswordDto;
    const forgot = await this.authService.forgotPassword(forgotPasswordDto);

    this.logger.verbose(`User ${email} forgot password`);
    return forgot;
  }

  @Post('/reset_password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    const { email } = resetPasswordDto;
    const reset = await this.authService.resetPassword(resetPasswordDto);

    this.logger.verbose(`User ${email} reset password`);
    return reset;
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string): Promise<void> {
    const remove = await this.authService.delete(id);
    this.logger.verbose(`User ${id} is deleted`);
    return remove;
  }
}
