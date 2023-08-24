import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LinkBankCardDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  itemId: string;
}
