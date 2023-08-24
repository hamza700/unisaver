import { IsNotEmpty, isNotEmpty } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  image: string;
}
