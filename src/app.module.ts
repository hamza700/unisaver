import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from 'config.schema';
import { AuthModule } from './auth/auth.module';
import { PlaidModule } from './plaid/plaid.module';
import { BankingModule } from './banking/banking.module';
import { StudentfinanceModule } from './studentfinance/studentfinance.module';
import { JobsModule } from './jobs/jobs.module';
import { BlogsModule } from './blogs/blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        synchronize: true,
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
      }),
    }),
    AuthModule,
    PlaidModule,
    BankingModule,
    StudentfinanceModule,
    JobsModule,
    BlogsModule,
  ],
})
export class AppModule {}
