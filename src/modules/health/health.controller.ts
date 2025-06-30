import { Controller, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import axios from 'axios';
import { Public } from 'common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @Public()
  @ApiOperation({ summary: 'Health check endpoints' })
  check() {
    return this.health.check([
      () => this.http.pingCheck('google', 'https://google.com'),
    ]);
  }

  @Public()
  @ApiOperation({ summary: 'Health check endpoints' })
  @Cron('45 * * * * *')
  async keepServerWakeUp() {
    const url = this.configService.get('API_URL');
    Logger.log(`Pinging ${url}/api/v1/health`, 'HealthController');

    try {
      const response = await axios.get(`${url}/api/v1/health`);
      Logger.log('Wake-up ping successful', 'HealthController');
      return response.data;
    } catch (error) {
      Logger.error('Wake-up ping failed', error, 'HealthController');
    }
  }

  @Get('db')
  @HealthCheck()
  @Public()
  @ApiOperation({ summary: 'Database health check endpoints' })
  checkDatabase() {
    return this.health.check([() => this.db.pingCheck('typeorm')]);
  }
}
