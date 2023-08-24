import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { JobSearchParamsDto } from './dto/job-search-params.dto';

@Injectable()
export class JobsService {
  constructor(private configService: ConfigService) {}

  async searchJobs(params: JobSearchParamsDto): Promise<any> {
    const options: AxiosRequestConfig = {
      method: 'GET',
      url: 'https://indeed12.p.rapidapi.com/jobs/search',
      params: {
        query: params.query,
        location: params.location,
        page_id: params.page_id,
        fromage: params.fromage,
        radius: params.radius,
      },
      headers: {
        'X-RapidAPI-Key': this.configService.get<string>('X_RAPIDAPI_KEY'),
        'X-RapidAPI-Host': this.configService.get<string>('X_RAPIDAPI_HOST'),
      },
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async getJobDetails(id: string): Promise<any> {
    const options: AxiosRequestConfig = {
      method: 'GET',
      url: `https://indeed12.p.rapidapi.com/job/${id}`,
      headers: {
        'X-RapidAPI-Key': this.configService.get<string>('X_RAPIDAPI_KEY'),
        'X-RapidAPI-Host': this.configService.get<string>('X_RAPIDAPI_HOST'),
      },
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}
