import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { PlaidService } from './plaid.service';
import { BankingService } from '../banking/banking.service';
import { ExchangePublicTokenDto } from './dto/exchange-public-token.dto';
import { AuthenticatedRequest } from './authenticated-request.interface';
import { GetUser } from 'src/auth/get-user-decorator';
import { User } from 'src/auth/user.entity';
import {
  AccountsGetResponse,
  AuthGetResponse,
  IdentityGetResponse,
  ItemPublicTokenExchangeResponse,
  LinkTokenCreateResponse,
  PlaidErrorType,
  Transaction,
} from 'plaid';
import { CreateSandboxPublicTokenDto } from './dto/create-sandbox-public-token.dto';
import { GetBankCard } from '../banking/get-bank-card-decorator'; // Import the decorator
import { BankCard } from 'src/banking/bank-card.entity';

@Controller('plaid')
export class PlaidController {
  private logger = new Logger('PlaidController');

  constructor(
    private plaidService: PlaidService,
    private bankingService: BankingService,
  ) {}

  @Get('/info')
  getInfo(@Res() res: Response): void {
    const plaidInfo = {
      // item_id: bankCard.itemId,
      // access_token: bankCard.accessToken,
      products: ['auth', 'transactions', 'identity'],
    };
    res.status(HttpStatus.OK).json(plaidInfo);
  }

  @Post('/link_token')
  @UseGuards(AuthGuard('jwt'))
  async createLinkToken(
    @GetUser() user: User,
  ): Promise<LinkTokenCreateResponse> {
    const linkToken = await this.plaidService.createLinkToken(user);
    this.logger.verbose(`Link token created ${linkToken} `);
    return linkToken;
  }

  @Post('/set_access_token')
  @UseGuards(AuthGuard('jwt'))
  async setAccessToken(
    @Body() body: { public_token: string },
  ): Promise<object> {
    return await this.plaidService.setAccessToken(body.public_token);
  }

  @Get('/auth')
  @UseGuards(AuthGuard('jwt'))
  async getAuth(@GetUser() user: User): Promise<AuthGetResponse> {
    this.logger.verbose(`Account numbers retrieved for user ${user.id} `);
    return await this.plaidService.getAuth(user);
  }

  @Get('/transactions')
  @UseGuards(AuthGuard('jwt'))
  async getTransactions(@GetUser() user: User): Promise<any> {
    const transactions = await this.plaidService.getTransactions(user);
    this.logger.verbose(
      `Transactions ${transactions} retrieved for user ${user.id} `,
    );
    return { latest_transactions: transactions }; // Add this line
  }

  @Get('balance')
  @UseGuards(AuthGuard('jwt'))
  async getBalances(@GetUser() user: User): Promise<AccountsGetResponse> {
    const balance = await this.plaidService.getBalances(user);
    this.logger.verbose(`Balance ${balance} retrieved for user ${user.id} `);
    return balance;
  }

  @Get('item')
  @UseGuards(AuthGuard('jwt'))
  async getItemInfo(@GetUser() user: User): Promise<any> {
    const info = await this.plaidService.getItemInfo(user);
    this.logger.verbose(`Info ${info} retrieved for user ${user.id} `);
    return {
      item: info.itemResponse.data.item,
      institution: info.instResponse.data.institution,
    };
  }

  @Get('accounts')
  @UseGuards(AuthGuard('jwt'))
  async getAccounts(@GetUser() user: User): Promise<AccountsGetResponse> {
    const accounts = await this.plaidService.getAccounts(user);
    this.logger.verbose(`Accounts ${accounts} retrieved for user ${user.id} `);
    return accounts;
  }

  @Get('identity')
  @UseGuards(AuthGuard('jwt'))
  async getIdentity(@GetUser() user: User): Promise<any> {
    const identity = await this.plaidService.getIdentity(user);
    this.logger.verbose(`Identity ${identity} retrieved for user ${user.id} `);
    return { identity: identity.data.accounts };
  }
}
