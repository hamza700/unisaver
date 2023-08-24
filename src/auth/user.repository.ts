import { SignUpDto } from './dto/sign-up.dto';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { sendVerificationEmail } from './email.utils'; // Create this function

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  private logger = new Logger('UsersRepository, true');

  async createUser(signUpDto: SignUpDto): Promise<void> {
    const { firstName, lastName, email, password } = signUpDto;

    //hash
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    user.verificationCode = Math.random().toString().slice(2, 8);

    try {
      await this.save(user);
      sendVerificationEmail(email, user.verificationCode);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      } else {
        this.logger.error('error', error.stack);
        throw new InternalServerErrorException();
      }
    }
  }
}
