import { Module, forwardRef } from '@nestjs/common';
import { PlaidService } from './plaid.service';
import { ConfigModule } from '@nestjs/config';
import { BankingModule } from '../banking/banking.module';
import { PlaidController } from './plaid.controller';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => BankingModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [PlaidService],
  exports: [PlaidService],
  controllers: [PlaidController],
})
export class PlaidModule {}
