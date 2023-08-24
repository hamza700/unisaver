import { GetBlogsFilterDto } from './dto/get-blogs-filter.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { User } from 'src/auth/user.entity';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(BlogsRepository)
    private blogsRepository: BlogsRepository,
  ) {}

  getBlogs(filterDto: GetBlogsFilterDto, user: User): Promise<Blog[]> {
    return this.blogsRepository.getBlogs(filterDto, user);
  }

  async getBlogById(id: string, user: User): Promise<Blog> {
    const found = await this.blogsRepository.findOne({ where: { id, user } });

    if (!found) {
      throw new NotFoundException(`Blog with ID ${id} not found `);
    }
    return found;
  }

  createBlog(createBlogDto: CreateBlogDto, user: User): Promise<Blog> {
    return this.blogsRepository.createBlog(createBlogDto, user);
  }

  async updateBlog(
    id: string,
    updateBlogDto: UpdateBlogDto,
    user: User,
  ): Promise<Blog> {
    const { title, description, content, image } = updateBlogDto;

    const blog = await this.getBlogById(id, user);

    if (title) {
      blog.title = title;
    }

    if (description) {
      blog.description = description;
    }

    if (content) {
      blog.content = content;
    }

    if (image) {
      blog.image = image;
    }

    await this.blogsRepository.save(blog);

    return blog;
  }

  async deleteBlog(id: string, user: User): Promise<void> {
    const result = await this.blogsRepository.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
  }
}
