import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { BankCard } from './bank-card.entity'; // Replace with your bank card entity

export const GetBankCard = createParamDecorator(
  (_data, ctx: ExecutionContext): BankCard => {
    const req = ctx.switchToHttp().getRequest();
    return req.bankCard;
  },
);
