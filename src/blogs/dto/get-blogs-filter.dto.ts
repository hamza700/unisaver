import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BlogSortBy } from '../blog-sort-by.enum';

export class GetBlogsFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BlogSortBy)
  sortBy?: BlogSortBy;
}
