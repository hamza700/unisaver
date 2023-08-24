import { IsNotEmpty, IsOptional } from 'class-validator';

export class JobSearchParamsDto {
  @IsNotEmpty()
  query: string;

  @IsNotEmpty()
  location: string;

  @IsOptional()
  page_id?: string;

  @IsOptional()
  fromage?: string;

  @IsOptional()
  radius?: string;
}
