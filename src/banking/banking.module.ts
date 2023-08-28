import { ConfigModule } from '@nestjs/config';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankingService } from './banking.service';
import { BankingController } from './banking.controller';
import { PlaidModule } from '../plaid/plaid.module';
import { BankCardRepository } from './bank-card.repository';
import { UsersRepository } from '../auth/user.repository';
import { PassportModule } from '@nestjs/passport';

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
