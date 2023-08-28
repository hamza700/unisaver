import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UsePipes,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BankingService } from './banking.service';
import { BankCard } from './bank-card.entity';
import { LinkBankCardDto } from './dto/link-bank-card.dto';
import { LinkBankCardValidationPipe } from './pipes/link-bank-card-validation.pipe';
import { VerifiedGuard } from 'src/auth/verified.guard';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/auth/get-user-decorator';

@Controller('banking')
@UseGuards(AuthGuard())
// @UseGuards(VerifiedGuard)
export class BankingController {
  private logger = new Logger('BankingController');

  constructor(private bankingService: BankingService) {}

  @Post('/link')
  @UseGuards(AuthGuard('jwt'))
  linkBankCard(
    @Body() linkBankCardDto: LinkBankCardDto,
    @GetUser() user: User,
  ): Promise<BankCard> {
    this.logger.verbose(
      `User ${user.email} creating a new bank card. Data: ${JSON.stringify(
        linkBankCardDto,
      )}`,
    );
    return this.bankingService.linkBankCard(linkBankCardDto, user);
  }

  @Get('/getAccessTokens')
  @UseGuards(AuthGuard('jwt'))
  async getAccessTokens(@GetUser() user: User): Promise<string[]> {
    return this.bankingService.getAccessTokens(user);
  }

  @Get()
  async getBankCards(@GetUser() user: User): Promise<BankCard[]> {
    return this.bankingService.getBankCards(user); // Replace with the actual user ID
  }

  @Delete(':id')
  async deleteBankCard(@Param('id') id: string): Promise<void> {
    await this.bankingService.deleteBankCard(id);
  }
}
