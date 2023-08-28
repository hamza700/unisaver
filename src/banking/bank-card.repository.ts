import { EntityRepository, Repository } from 'typeorm';
import { BankCard } from './bank-card.entity';
import { LinkBankCardDto } from './dto/link-bank-card.dto';
import { User } from '../auth/user.entity';

@EntityRepository(BankCard)
export class BankCardRepository extends Repository<BankCard> {
  async linkBankCard(
    linkBankCardDto: LinkBankCardDto,
    user: User,
  ): Promise<BankCard> {
    const { accessToken, itemId } = linkBankCardDto;

    const card = this.create({
      accessToken,
      itemId,
      user,
    });

    await this.save(card);
    return card;
  }
}
