import { IsString, IsArray } from 'class-validator';

export class CreateSandboxPublicTokenDto {
  @IsString()
  institutionID: string;

  @IsArray()
  initialProductNames: string[];
}
