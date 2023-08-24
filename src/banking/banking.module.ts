import { ConfigModule } from '@nestjs/config';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankCard } from './bank-card.entity';
import { BankingService } from './banking.service';
import { BankingController } from './banking.controller';
import { PlaidModule } from 'src/plaid/plaid.module';
import { BankCardRepository } from './bank-card.repository';
import { UsersRepository } from 'src/auth/user.repository';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from 'src/auth/auth.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([BankCardRepository, UsersRepository]),
    forwardRef(() => PlaidModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [BankingService],
  exports: [BankingService],
  controllers: [BankingController],
})
export class BankingModule {}
