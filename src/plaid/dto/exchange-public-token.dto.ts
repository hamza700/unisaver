import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangePublicTokenDto {
  @IsNotEmpty()
  publicToken: string;
}
