import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BlogsRepository } from './blogs.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BlogsRepository]), AuthModule],
  providers: [BlogsService],
  controllers: [BlogsController],
})
export class BlogsModule {}
