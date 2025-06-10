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
  @Cron('0 */15 6-23 * * *')
  keepServerWakeUp() {
    const configService = new ConfigService();
    Logger.log('Health check endpoint called', 'HealthController');
    return axios(configService.get('API_URL') + '/health');
  }

  @Get('db')
  @HealthCheck()
  @Public()
  @ApiOperation({ summary: 'Database health check endpoints' })
  checkDatabase() {
    return this.health.check([() => this.db.pingCheck('typeorm')]);
  }
}
