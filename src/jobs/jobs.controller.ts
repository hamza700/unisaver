import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobSearchParamsDto } from './dto/job-search-params.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('jobs')
export class JobsController {
  private logger = new Logger('JobsController');

  constructor(private readonly jobsService: JobsService) {}

  @Get('/search')
  @UseGuards(AuthGuard('jwt'))
  async searchJobs(@Query() params: JobSearchParamsDto) {
    const jobListings = await this.jobsService.searchJobs(params);
    this.logger.verbose(`Job search done`);
    return jobListings;
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  async getJobDetails(@Param('id') id: string) {
    const retrieve = await this.jobsService.getJobDetails(id);
    this.logger.verbose(`Job details for job id ${id} is retrieved`);
    return retrieve;
  }

  // You can add more routes and actions as needed
}
