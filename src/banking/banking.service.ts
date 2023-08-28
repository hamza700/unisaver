import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaidService } from '../plaid/plaid.service';
import { BankCard } from './bank-card.entity';
import { BankCardRepository } from './bank-card.repository';
import { User } from '../auth/user.entity'; // Import the User entity
import { UsersRepository } from 'src/auth/user.repository';
import { LinkBankCardDto } from './dto/link-bank-card.dto';

@Injectable()
export class BankingService {
  private logger = new Logger('BankingService');

  constructor(
    @InjectRepository(BankCardRepository)
    private bankCardRepository: BankCardRepository,
    @InjectRepository(UsersRepository)
    private userRepository: UsersRepository,
  ) {}

  linkBankCard(
    linkBankCardDto: LinkBankCardDto,
    user: User,
  ): Promise<BankCard> {
    return this.bankCardRepository.linkBankCard(linkBankCardDto, user);
  }

  async getAccessTokens(user: User): Promise<string[]> {
    const bankCards = await this.bankCardRepository.find({
      where: { user },
      select: ['accessToken'], // Select only the accessToken field
    });

    return bankCards.map((bankCard) => bankCard.accessToken);
  }

  async deleteBankCard(id: string): Promise<void> {
    const result = await this.bankCardRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async getBankCards(user: User): Promise<BankCard[]> {
    return this.bankCardRepository.find({ user });
  }
}
