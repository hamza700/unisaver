import { EntityRepository, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Blog } from './blog.entity';
import { GetBlogsFilterDto } from './dto/get-blogs-filter.dto';
import { BlogSortBy } from './blog-sort-by.enum';
import { CreateBlogDto } from './dto/create-blog.dto';

@EntityRepository(Blog)
export class BlogsRepository extends Repository<Blog> {
  private logger = new Logger('BlogsRepository, true');

  async getBlogs(filterDto: GetBlogsFilterDto, user: User): Promise<Blog[]> {
    const { sortBy, search } = filterDto;

    const query = this.createQueryBuilder('blog');
    query.where({ user });

    if (sortBy) {
      if (sortBy === BlogSortBy.LATEST) {
        query.orderBy('blog.createdAt', 'DESC');
      } else if (sortBy === BlogSortBy.OLDEST) {
        query.orderBy('blog.createdAt', 'ASC');
      }
    }

    if (search) {
      query.andWhere(
        '(LOWER(blog.title) LIKE LOWER(:search) OR LOWER(blog.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      const blogs = await query.getMany();
      return blogs;
    } catch (error) {
      this.logger.error(
        `Failed to get blogs for user "${user.id}". Filters: ${JSON.stringify(
          filterDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createBlog(createBlogDto: CreateBlogDto, user: User): Promise<Blog> {
    const { title, description, content, image } = createBlogDto;

    const blog = this.create({
      title,
      description,
      content,
      image,
      user,
    });

    await this.save(blog);
    return blog;
  }
}
