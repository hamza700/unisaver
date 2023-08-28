import { AuthGuard } from '@nestjs/passport';
import { CreateBlogDto } from './dto/create-blog.dto';
import { GetBlogsFilterDto } from './dto/get-blogs-filter.dto';
import { Blog } from './blog.entity';
import { BlogsService } from './blogs.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/get-user-decorator';
import { User } from '../auth/user.entity';
import { Logger } from '@nestjs/common';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
@UseGuards(AuthGuard())
export class BlogsController {
  private logger = new Logger('BlogsController');

  constructor(private blogsService: BlogsService) {}

  @Get()
  getBlogs(
    @Query() filterDto: GetBlogsFilterDto,
    @GetUser() user: User,
  ): Promise<Blog[]> {
    this.logger.verbose(
      `User "${user.id}" retrieving all blogs. Filters: ${JSON.stringify(
        filterDto,
      )}`,
    );
    return this.blogsService.getBlogs(filterDto, user);
  }

  @Get('/:id')
  getBlogByID(@Param('id') id: string, @GetUser() user: User): Promise<Blog> {
    return this.blogsService.getBlogById(id, user);
  }

  @Post()
  createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @GetUser() user: User,
  ): Promise<Blog> {
    this.logger.verbose(
      `User ${user.id} creating a new blog. Data: ${JSON.stringify(
        createBlogDto,
      )}`,
    );
    return this.blogsService.createBlog(createBlogDto, user);
  }

  @Patch('/:id')
  updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @GetUser() user: User,
  ): Promise<Blog> {
    return this.blogsService.updateBlog(id, updateBlogDto, user);
  }

  @Delete('/:id')
  deleteBlog(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.blogsService.deleteBlog(id, user);
  }
}
