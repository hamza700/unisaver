import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LinkBankCardDto } from '../dto/link-bank-card.dto';

@Injectable()
export class LinkBankCardValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const linkBankCardDto = plainToClass(LinkBankCardDto, value);

    const errors = await validate(linkBankCardDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return value;
  }
}
